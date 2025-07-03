import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { JwtUtil } from '../shared/utils/jwt-utils';
import Keycloak from 'keycloak-js';

@Injectable()
export class KeycloakService {
  private configService = inject(ConfigService);

  public LAST_IDP_AUTHENTICATED = 'kc-last-idp-authenticated';
  private keycloakAuth: any;
  public keycloakEnabled: boolean;
  private keycloakUrl: string;
  private keycloakRealm: string;

  public readonly idpHintEnum = {
    IDIR: 'idir',
  };

  async init() {
    // Load up the config service data
    this.keycloakEnabled = this.configService.config['KEYCLOAK_ENABLED'];
    this.keycloakUrl = this.configService.config['KEYCLOAK_URL'];
    this.keycloakRealm = this.configService.config['KEYCLOAK_REALM'];

    if (this.keycloakEnabled) {
      // Bootup KC
      const keycloak_client_id =
        this.configService.config['KEYCLOAK_CLIENT_ID'];

      return new Promise<void>((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: this.keycloakRealm,
          clientId: !keycloak_client_id ? 'eagle-admin-console' : keycloak_client_id
        };

        // this.loggerService.debug('KC Auth init.');

        this.keycloakAuth = new Keycloak(config);

        this.keycloakAuth.onAuthSuccess = () => {
          // this.loggerService.debug('onAuthSuccess');
          const idp = this.getIdpFromToken();
          if (idp !== '') {
            localStorage.setItem(
              this.LAST_IDP_AUTHENTICATED,
              idp
            );
          }
        };

        this.keycloakAuth.onAuthError = function () {
          console.log('onAuthError');
        };

        this.keycloakAuth.onAuthRefreshSuccess = function () {
          // console.log('onAuthRefreshSuccess');
        };

        this.keycloakAuth.onAuthRefreshError = function () {
          console.log('onAuthRefreshError');
          this.keycloakAuth.login({ idpHint: this.idpHintEnum.IDIR });
        };

        this.keycloakAuth.onAuthLogout = () => {
          // console.log('onAuthLogout');
        };

        // Try to get refresh tokens in the background
        this.keycloakAuth.onTokenExpired = () => {
          this.keycloakAuth
            .updateToken()
            .then((refreshed) => {
              console.log('KC refreshed token?:', refreshed);
            })
            .catch((err) => {
              console.log('onTokenExpired:KC refresh error:', err);
            });
        };

        // Initialize.
        this.keycloakAuth
          .init({
            onLoad: 'login-required',
            pkceMethod: 'S256',
          })
          .then((auth) => {
            console.log('KC Success:', auth);
            resolve();
          })
          .catch((err) => {
            console.log('KC error2:', err);
            reject();
          });
      });
    }
  }

  /**
   * Check if the current user is logged in.
   *
   * @returns {boolean} true if the user is logged in.
   * @memberof KeycloakService
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return this.keycloakAuth && this.keycloakAuth.authenticated === true;
  }

  /**
   * Check if the current user is logged in and has admin access.
   *
   * @returns {boolean} true if the user has access, false otherwise.
   * @memberof KeycloakService
   */
  isAuthorized(): boolean {
    if (!this.getToken()) {
      return false;
    }
    const jwt = JwtUtil.decodeToken(this.getToken());

    if (jwt && jwt.realm_access && jwt.realm_access.roles) {
      return jwt.realm_access.roles.includes('sysadmin');
    } else {
      return false;
    }
  }

  /**
   * Returns the current keycloak auth token.
   *
   * @returns {string} keycloak auth token.
   * @memberof KeycloakService
   */
  getToken(): string {
    return this.keycloakAuth && this.keycloakAuth.token;
  }
  getUserRoles() {
    const jwt = JwtUtil.decodeToken(this.keycloakAuth.token);
    if (jwt && jwt.realm_access && jwt.realm_access.roles) {
      return jwt.realm_access.roles;
    } else {
      return null;
    }
  }

  /**
   * Returns an observable that emits when the auth token has been refreshed.
   * Call {@link KeycloakService#getToken} to fetch the updated token.
   *
   * @returns {Observable<string>}
   * @memberof KeycloakService
   */
  refreshToken(): Observable<any> {
    return new Observable((observer) => {
      this.keycloakAuth
        .updateToken(30)
        .then((refreshed) => {
          console.log(`KC refreshed token?: ${refreshed}`);
          observer.next(refreshed);
          observer.complete();
        })
        .catch((err) => {
          console.log(`KC refresh error: ${err}`);
          observer.error();
        });

      return { unsubscribe() { } };
    });
  }

  public getWelcomeMessage(): string {
    const token = this.getToken();

    if (!token) {
      return '';
    }

    const jwt = JwtUtil.decodeToken(token);

    if (!jwt || !jwt.name) {
      return '';
    }

    return `${jwt.name}`;
  }

  /**
   * Redirects to keycloak and logs in
   *
   * @param {string} idpHint see idpHintEnum for valid values
   * @memberof KeycloakService
   */
  login(idpHint: string) {
    let redirectUri = localStorage.getItem(this.configService.config.REDIRECT_KEY) || window.location.href;
    // by default keycloak login will want to redirect back to the login page
    // redirect to '/dayuse' instead
    if (redirectUri.endsWith('/login')) {
      redirectUri = redirectUri.slice(0, redirectUri.lastIndexOf('/'));
    }
    return (
      this.keycloakAuth &&
      this.keycloakAuth.login({ idpHint: idpHint, redirectUri: redirectUri })
    );
  }

  /**
   * Infers the identity provider from the JWT token
   *
   * @remarks
   * If IDIR and BCEID users are being redirected to the BCSC login
   * page to re-authenticate, it means the client mappers in Keycloak
   * (idir_userid and bceid_userid) haven't been properly setup.
   *
   * @memberof KeycloakService
   */
  getIdpFromToken(): string {
    const token = this.getToken();

    if (!token) {
      return '';
    }

    const jwt = JwtUtil.decodeToken(token);

    // idir users have an idir_userid property
    if (jwt.idir_user_guid !== undefined) {
      return this.idpHintEnum.IDIR;
    }
  }

  getLogoutURL(): string {
    // https://logon.gov.bc.ca/clp-cgi/logoff.cgi?returl=http://localhost:4200/admin/
    // https://logontest.gov.bc.ca/clp-cgi/logoff.cgi?returl=http://localhost:4200/admin/
    if (this.keycloakEnabled) {
      return this.keycloakAuth.authServerUrl + '/realms/' + this.keycloakRealm + '/protocol/openid-connect/logout?redirect_uri=' + window.location.origin + '/admin/not-authorized?loggedout=true';
    } else {
      // go to the /login page
      return window.location.origin + '/admin/login';
    }
  }
}
