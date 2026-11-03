import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthGuard } from './auth-guard.service';
import { KeycloakService } from './keycloak.service';
import { ConfigService } from './config.service';

describe('AuthGuard', () => {
  const LAST_IDP = 'kc-last-idp-authenticated';
  const REDIRECT_KEY = 'ADMIN_REDIRECT';
  let keycloak: jasmine.SpyObj<KeycloakService>;
  let router: Router;
  let guard: AuthGuard;

  beforeEach(() => {
    localStorage.removeItem(LAST_IDP);
    localStorage.removeItem(REDIRECT_KEY);
    keycloak = jasmine.createSpyObj('KeycloakService', ['isAuthenticated', 'isAuthorized', 'login'], {
      LAST_IDP_AUTHENTICATED: LAST_IDP,
      idpHintEnum: { IDIR: 'idir' },
    });
    const config = jasmine.createSpyObj('ConfigService', ['config']);
    config.config.and.returnValue({ REDIRECT_KEY });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: KeycloakService, useValue: keycloak },
        { provide: ConfigService, useValue: config },
      ],
    });
    router = TestBed.inject(Router);
    guard = TestBed.inject(AuthGuard);
  });

  afterEach(() => {
    localStorage.removeItem(LAST_IDP);
    localStorage.removeItem(REDIRECT_KEY);
  });

  describe('when not signed in', () => {
    beforeEach(() => keycloak.isAuthenticated.and.returnValue(false));

    it('starts a keycloak IDIR login for a first-time visitor', () => {
      expect(guard.canActivate()).toBeFalse();
      expect(keycloak.login).toHaveBeenCalledOnceWith('idir');
    });

    it('starts a keycloak login with the identity provider used last time', () => {
      localStorage.setItem(LAST_IDP, 'bceidbasic');

      expect(guard.canActivate()).toBeFalse();
      expect(keycloak.login).toHaveBeenCalledOnceWith('bceidbasic');
    });

    it('forgets the last identity provider so a failed attempt falls back to IDIR next time', () => {
      localStorage.setItem(LAST_IDP, 'idir');

      guard.canActivate();

      expect(localStorage.getItem(LAST_IDP)).toBeNull();
    });

    it('stores the requested page to return to after login', () => {
      guard.canActivate();

      expect(localStorage.getItem(REDIRECT_KEY)).toBe(window.location.href);
    });
  });

  describe('when signed in', () => {
    beforeEach(() => keycloak.isAuthenticated.and.returnValue(true));

    it('sends a user without the sysadmin role to /not-authorized', () => {
      keycloak.isAuthorized.and.returnValue(false);

      expect(guard.canActivate()).toEqual(router.parseUrl('/not-authorized'));
    });

    it('lets a sysadmin through', () => {
      keycloak.isAuthorized.and.returnValue(true);

      expect(guard.canActivate()).toBeTrue();
    });

    it('clears the stored post-login redirect', () => {
      keycloak.isAuthorized.and.returnValue(true);
      localStorage.setItem(REDIRECT_KEY, 'http://localhost/admin/p/123');

      guard.canActivate();

      expect(localStorage.getItem(REDIRECT_KEY)).toBeNull();
    });
  });
});
