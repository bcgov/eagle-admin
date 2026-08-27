import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { GateService } from './gate.service';
import { ApiService } from './api';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';

describe('GateService', () => {
  let http: HttpTestingController;
  const config = signal<any>({ API_PATH: '/api', ACCESS_GATE: true });

  function makeService(): GateService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        GateService,
        ApiService,
        { provide: ConfigService, useValue: { config, getApiPath: () => '/api' } },
        { provide: KeycloakService, useValue: jasmine.createSpyObj('KeycloakService', ['getToken', 'init']) }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(GateService);
  }

  beforeEach(() => {
    sessionStorage.removeItem('eagle-gate');
    config.set({ API_PATH: '/api', ACCESS_GATE: true });
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    sessionStorage.removeItem('eagle-gate');
  });

  it('stays open when the environment sets no gate', () => {
    config.set({ API_PATH: '/api', ACCESS_GATE: false });
    expect(makeService().open()).toBe(true);
  });

  it('is closed on a gated environment until the tab is unlocked', () => {
    expect(makeService().open()).toBe(false);
  });

  it('opens without asking the API when the tab already unlocked', () => {
    sessionStorage.setItem('eagle-gate', '1');
    expect(makeService().open()).toBe(true);
  });

  it('opens the gate and remembers the tab on 204', async () => {
    const service = makeService();

    const unlocked = service.unlock('hunter2');
    const req = http.expectOne('/api/public/gate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ password: 'hunter2' });
    req.flush(null, { status: 204, statusText: 'No Content' });
    await unlocked;

    expect(service.open()).toBe(true);
    expect(sessionStorage.getItem('eagle-gate')).toBe('1');
  });

  it('rejects with the 401 and leaves the gate closed on a wrong password', async () => {
    const service = makeService();

    const unlocked = service.unlock('nope');
    http.expectOne('/api/public/gate').flush({ error: 'Invalid password' }, { status: 401, statusText: 'Unauthorized' });

    await expectAsync(unlocked).toBeRejectedWith(jasmine.objectContaining({ status: 401 }));
    expect(service.open()).toBe(false);
    expect(sessionStorage.getItem('eagle-gate')).toBeNull();
  });
});
