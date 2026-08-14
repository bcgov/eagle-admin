import { ConfigService } from './config.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoggingService } from './logging.service';
import { LoadingStateService } from './loading-state.service';

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
});
