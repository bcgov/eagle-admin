import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CentreAccessService } from './centre-access.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';

describe('CentreAccessService', () => {
  const CENTRE_URL = 'https://centre-api.example.gov.bc.ca';
  const ENDPOINT = `${CENTRE_URL}/api/eao-analytics`;

  let service: CentreAccessService;
  let http: HttpTestingController;
  let configSignal: ReturnType<typeof signal<Record<string, unknown>>>;
  let token: string;
  let logger: jasmine.SpyObj<LoggingService>;

  function jwt(claims: Record<string, unknown>): string {
    const b64 = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${b64({ alg: 'none' })}.${b64(claims)}.sig`;
  }

  beforeEach(() => {
    configSignal = signal<Record<string, unknown>>({ CENTRE_API_URL: CENTRE_URL });
    token = jwt({ identity_provider: 'idir', preferred_username: 'abc123@idir', sub: 'sub-1' });
    logger = jasmine.createSpyObj('LoggingService', ['debug', 'info', 'warn', 'error']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CentreAccessService,
        { provide: ConfigService, useValue: { config: configSignal } },
        { provide: KeycloakService, useValue: { getToken: () => token, idpHintEnum: { IDIR: 'idir' } } },
        { provide: LoggingService, useValue: logger }
      ]
    });

    service = TestBed.inject(CentreAccessService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the IDIR user and epic_public to centre-api with the bearer token', async () => {
    const done = service.recordAccess();

    const req = http.expectOne(ENDPOINT);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user_auth_guid: 'abc123@idir', app_name: 'epic_public' });
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({ id: 1 });
    await done;
  });

  it('falls back to sub when the token has no preferred_username', async () => {
    token = jwt({ identity_provider: 'idir', sub: 'sub-1' });
    const done = service.recordAccess();

    const req = http.expectOne(ENDPOINT);
    expect(req.request.body.user_auth_guid).toBe('sub-1');
    req.flush({});
    await done;
  });

  it('trims trailing slashes off CENTRE_API_URL', async () => {
    configSignal.set({ CENTRE_API_URL: `${CENTRE_URL}//` });
    const done = service.recordAccess();

    http.expectOne(ENDPOINT).flush({});
    await done;
  });

  it('sends nothing when CENTRE_API_URL is empty', async () => {
    configSignal.set({ CENTRE_API_URL: '' });

    await service.recordAccess();
    http.expectNone(() => true);
  });

  it('sends nothing for a user who did not sign in with IDIR', async () => {
    token = jwt({ identity_provider: 'bceidbasic', preferred_username: 'someone@bceidbasic' });

    await service.recordAccess();
    http.expectNone(() => true);
  });

  it('resolves and logs a warning when centre-api rejects the request', async () => {
    const done = service.recordAccess();

    http.expectOne(ENDPOINT).flush({ message: 'unknown app' }, { status: 400, statusText: 'Bad Request' });
    await expectAsync(done).toBeResolved();
    expect(logger.warn).toHaveBeenCalledWith('Could not record last access in EPIC.centre', 'CentreAccessService', jasmine.anything());
  });
});
