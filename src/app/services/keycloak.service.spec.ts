import { TestBed } from '@angular/core/testing';
import { KeycloakService } from './keycloak.service';
import { ConfigService } from './config.service';
import { LoggingService } from './logging.service';

// Payloads base64url-encoded outside the app from {"realm_access":{"roles":[...]}}.
const HEADER = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';
const SYSADMIN_TOKEN = `${HEADER}.eyJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsic3RhZmYiLCJzeXNhZG1pbiJdfX0.sig`;
const STAFF_TOKEN = `${HEADER}.eyJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsic3RhZmYiLCJpbnNwZWN0b3IiXX19.sig`;
// Payload {"preferred_username":"jdoe@idir"}
const NO_ROLES_TOKEN = `${HEADER}.eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiJqZG9lQGlkaXIifQ.sig`;

describe('KeycloakService.isAuthorized', () => {
  let service: KeycloakService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: jasmine.createSpyObj('ConfigService', ['config']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'warn', 'error']) },
      ],
    });
    service = TestBed.inject(KeycloakService);
  });

  it('allows a token carrying the sysadmin realm role', () => {
    spyOn(service, 'getToken').and.returnValue(SYSADMIN_TOKEN);

    expect(service.isAuthorized()).toBeTrue();
  });

  it('refuses a token whose realm roles lack sysadmin', () => {
    spyOn(service, 'getToken').and.returnValue(STAFF_TOKEN);

    expect(service.isAuthorized()).toBeFalse();
  });

  it('refuses a token with no realm roles', () => {
    spyOn(service, 'getToken').and.returnValue(NO_ROLES_TOKEN);

    expect(service.isAuthorized()).toBeFalse();
  });

  it('refuses a malformed token', () => {
    spyOn(service, 'getToken').and.returnValue('not-a-jwt');

    expect(service.isAuthorized()).toBeFalse();
  });

  it('refuses when there is no token', () => {
    spyOn(service, 'getToken').and.returnValue(undefined);

    expect(service.isAuthorized()).toBeFalse();
  });
});
