import { ConfigService } from './config.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoggingService } from './logging.service';
import { LoadingStateService } from './loading-state.service';
import { List } from '../models/demi/list';

describe('ConfigService', () => {
  let service: ConfigService;
  let savedEnv: any;

  // Minimal env.js stand-in — deployed shape, so fetchRemoteConfig runs.
  const deployedEnv = {
    configEndpoint: true,
    ENVIRONMENT: 'dev',
    KEYCLOAK_CLIENT_ID: 'eagle-admin-console',
    KEYCLOAK_URL: 'https://dev.loginproxy.gov.bc.ca/auth',
    KEYCLOAK_REALM: 'eao-epic'
  };

  const keycloakConfig = { KEYCLOAK_URL: 'https://test.loginproxy.gov.bc.ca/auth', KEYCLOAK_REALM: 'eao-epic' };

  function fakeResponse(ok: boolean, body: any) {
    return Promise.resolve({ ok, status: ok ? 200 : 503, json: () => Promise.resolve(body) } as any);
  }

  /** Answers DEMI /config and /config/public; any other URL fails the boot. */
  function stubFetch(config: Promise<any>, site: Promise<any> = fakeResponse(true, {})) {
    const routes: Record<string, Promise<any>> = { '/demi/api/config': config, '/demi/api/config/public': site };
    return spyOn(window, 'fetch').and.callFake(((url: string) => routes[url] ?? Promise.reject(new Error(`unexpected ${url}`))) as any);
  }

  beforeEach(() => {
    savedEnv = window.__env;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ConfigService,
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: LoadingStateService, useValue: jasmine.createSpyObj('LoadingStateService', ['startLoading', 'stopLoading']) }
      ]
    });

    service = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    window.__env = savedEnv;
  });

  it('rejects when DEMI /config returns a non-2xx response', async () => {
    window.__env = { ...deployedEnv };
    stubFetch(fakeResponse(false, {}));

    await expectAsync(service.init()).toBeRejected();
  });

  it('rejects when the fetch itself fails', async () => {
    window.__env = { ...deployedEnv };
    stubFetch(Promise.reject(new TypeError('Failed to fetch')));

    await expectAsync(service.init()).toBeRejected();
  });

  it('rejects a 200 with no KEYCLOAK_URL and merges nothing from it', async () => {
    window.__env = { ...deployedEnv };
    stubFetch(fakeResponse(true, { KEYCLOAK_REALM: 'eao-epic' }), fakeResponse(true, { BANNER_COLOUR: 'orange' }));

    await expectAsync(service.init()).toBeRejected();
    expect(service.config().KEYCLOAK_URL).toBe('https://dev.loginproxy.gov.bc.ca/auth');
    expect(service.config().BANNER_COLOUR).toBeUndefined();
  });

  it('skips the fetch entirely when configEndpoint is false (local dev)', async () => {
    window.__env = { ...deployedEnv, configEndpoint: false };
    const fetchSpy = spyOn(window, 'fetch');

    await expectAsync(service.init()).toBeResolved();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('takes Keycloak from DEMI /config and site values from /config/public, nothing from eagle-api', async () => {
    window.__env = { ...deployedEnv, BANNER_COLOUR: 'blue', KEYCLOAK_ENABLED: true, API_PATH: '/api' };
    const fetchSpy = stubFetch(
      fakeResponse(true, { ...keycloakConfig, KEYCLOAK_CLIENT_ID: 'demi-admin', KEYCLOAK_ENABLED: false, BANNER_COLOUR: 'blue' }),
      fakeResponse(true, {
        ENVIRONMENT: 'test', BANNER_COLOUR: 'orange', EAGLE_ANALYTICS_URL: '/api/usage',
        APPINSIGHTS_CONNECTION_STRING: 'InstrumentationKey=test', API_PATH: '/public-api'
      })
    );

    await service.init();
    expect(service.config()).toEqual(jasmine.objectContaining({
      ...keycloakConfig,
      KEYCLOAK_CLIENT_ID: 'eagle-admin-console',
      KEYCLOAK_ENABLED: true,
      ENVIRONMENT: 'dev',
      API_PATH: '/api',
      BANNER_COLOUR: 'orange',
      EAGLE_ANALYTICS_URL: '/api/usage',
      APPINSIGHTS_CONNECTION_STRING: 'InstrumentationKey=test'
    }));
    expect(fetchSpy.calls.allArgs().map(args => args[0]).sort()).toEqual(['/demi/api/config', '/demi/api/config/public']);
  });

  it('boots on env.js site values when DEMI /config/public is unavailable', async () => {
    window.__env = { ...deployedEnv, BANNER_COLOUR: 'blue' };
    stubFetch(fakeResponse(true, keycloakConfig), fakeResponse(false, { error: 'Public configuration is unavailable.' }));

    await service.init();
    expect(service.config().KEYCLOAK_URL).toBe(keycloakConfig.KEYCLOAK_URL);
    expect(service.config().BANNER_COLOUR).toBe('blue');
  });

  it('defaults the DEMI path to /demi/api when no source sets DEMI_API_PATH', async () => {
    window.__env = { ...deployedEnv, configEndpoint: false };

    await service.init();
    expect(service.getDemiApiPath()).toBe('/demi/api');
  });

  describe('lists', () => {
    let http: HttpTestingController;

    const row = (n: number, type = 'doctype'): List =>
      ({ id: `5cf00c03a266b7e1877504${String(n).padStart(2, '0')}`, name: `Item ${n}`, type, legislation: 2018, listOrder: n });
    const rows = (from: number, count: number) => Array.from({ length: count }, (_, i) => row(from + i));

    // ensureListsLoaded asks for page 1, then awaits it before asking for the rest.
    async function nextListsRequest(page: number): Promise<TestRequest> {
      await new Promise(resolve => setTimeout(resolve));
      return http.expectOne(r => r.url === '/demi/api/lists' && r.params.get('page') === String(page));
    }

    beforeEach(() => {
      http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('asks DEMI for page 1 with a page size and the total count', async () => {
      const loaded = service.ensureListsLoaded();

      const req = await nextListsRequest(1);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageSize')).toBe('100');
      expect(req.request.params.get('count')).toBe('true');
      req.flush([row(1)], { headers: { 'x-total-count': '1' } });
      await loaded;
    });

    it('pages until x-total-count rows are loaded', async () => {
      const loaded = service.ensureListsLoaded();

      (await nextListsRequest(1)).flush(rows(0, 100), { headers: { 'x-total-count': '230' } });
      (await nextListsRequest(2)).flush(rows(100, 100));
      (await nextListsRequest(3)).flush(rows(200, 30));
      await loaded;

      expect(service.lists.length).toBe(230);
      expect(service.lists[229].id).toBe(row(229).id);
    });

    it('keeps rows keyed by the DEMI id, so a document field resolves by id', async () => {
      const region = row(7, 'region');
      const loaded = service.ensureListsLoaded();

      (await nextListsRequest(1)).flush([row(1), region], { headers: { 'x-total-count': '2' } });
      await loaded;

      expect(service.listsSignal().find(l => l.id === region.id)?.name).toBe('Item 7');
      expect(service.regions).toEqual(['Item 7']);
    });

    it('treats an answer without x-total-count as a failure and fetches again on the next call', async () => {
      const first = service.ensureListsLoaded();
      (await nextListsRequest(1)).flush([row(1)]);
      await first;
      expect(service.lists).toEqual([]);

      const retry = service.ensureListsLoaded();
      (await nextListsRequest(1)).flush([row(1)], { headers: { 'x-total-count': '1' } });
      await retry;
      expect(service.lists.length).toBe(1);
    });
  });
});
