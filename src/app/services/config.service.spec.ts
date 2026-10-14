import { ConfigService } from './config.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoggingService } from './logging.service';
import { LoadingStateService } from './loading-state.service';
import { KeycloakService } from './keycloak.service';
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

  function fakeResponse(ok: boolean, body: any) {
    return Promise.resolve({ ok, status: ok ? 200 : 503, json: () => Promise.resolve(body) } as any);
  }

  beforeEach(() => {
    savedEnv = window.__env;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ConfigService,
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: LoadingStateService, useValue: jasmine.createSpyObj('LoadingStateService', ['startLoading', 'stopLoading']) }
      ]
    });

    service = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    window.__env = savedEnv;
  });

  it('rejects when /api/config returns a non-2xx response', async () => {
    window.__env = { ...deployedEnv };
    spyOn(window, 'fetch').and.returnValue(fakeResponse(false, {}));

    await expectAsync(service.init()).toBeRejected();
  });

  it('rejects when the fetch itself fails', async () => {
    window.__env = { ...deployedEnv };
    spyOn(window, 'fetch').and.returnValue(Promise.reject(new TypeError('Failed to fetch')));

    await expectAsync(service.init()).toBeRejected();
  });

  it('rejects a 200 with no KEYCLOAK_URL and merges nothing from it', async () => {
    window.__env = { ...deployedEnv };
    spyOn(window, 'fetch').and.returnValue(fakeResponse(true, { ENVIRONMENT: 'prod', KEYCLOAK_REALM: 'eao-epic' }));

    await expectAsync(service.init()).toBeRejected();
    expect(service.config().KEYCLOAK_URL).toBe('https://dev.loginproxy.gov.bc.ca/auth');
    expect(service.config().ENVIRONMENT).toBe('dev');
  });

  it('rejects a partially seeded document whose KEYCLOAK_URL is null', async () => {
    window.__env = { ...deployedEnv };
    spyOn(window, 'fetch').and.returnValue(fakeResponse(true, { KEYCLOAK_URL: null, KEYCLOAK_REALM: null }));

    await expectAsync(service.init()).toBeRejected();
  });

  it('skips the fetch entirely when configEndpoint is false (local dev)', async () => {
    window.__env = { ...deployedEnv, configEndpoint: false };
    const fetchSpy = spyOn(window, 'fetch');

    await expectAsync(service.init()).toBeResolved();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('preserves KEYCLOAK_CLIENT_ID from env.js over the API value', async () => {
    window.__env = { ...deployedEnv };
    spyOn(window, 'fetch').and.returnValue(fakeResponse(true, {
      KEYCLOAK_CLIENT_ID: 'eagle-api-console',
      KEYCLOAK_URL: 'https://loginproxy.gov.bc.ca/auth',
      KEYCLOAK_REALM: 'eao-epic'
    }));

    await service.init();
    expect(service.config().KEYCLOAK_CLIENT_ID).toBe('eagle-admin-console');
  });

  it('defaults the DEMI path to /demi/api when no source sets DEMI_API_PATH', async () => {
    window.__env = { ...deployedEnv, configEndpoint: false };

    await service.init();
    expect(service.getDemiApiPath()).toBe('/demi/api');
  });

  it('takes DEMI_API_PATH from /api/config over env.js', async () => {
    window.__env = { ...deployedEnv, DEMI_API_PATH: '/demi/api' };
    spyOn(window, 'fetch').and.returnValue(fakeResponse(true, {
      KEYCLOAK_URL: 'https://dev.loginproxy.gov.bc.ca/auth',
      KEYCLOAK_REALM: 'eao-epic',
      DEMI_API_PATH: '/demi-next/api'
    }));

    await service.init();
    expect(service.getDemiApiPath()).toBe('/demi-next/api');
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
