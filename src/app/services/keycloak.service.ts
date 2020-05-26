import { Injectable } from '@angular/core';
import { JwtUtil } from 'app/jwt-util';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {
  private keycloakAuth: any;
  private keycloakEnabled: boolean;
  private keycloakUrl: string;
  private keycloakRealm: string;
  private loggedOut: string;

  constructor() {
    switch (window.location.origin) {
      // Always enable sso
      // case 'http://localhost:4200':
      //   // Local
      //   this.keycloakEnabled = false;
      //   break;

      case 'https://eagle-dev.pathfinder.gov.bc.ca':
        // Dev etc
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://sso.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = 'eagle';
        break;

      default:
        // Prod
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://sso.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = 'eagle';
    }
  }

  isKeyCloakEnabled(): boolean {
    return this.keycloakEnabled;
  }

  private getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  init(): Promise<any> {

    this.loggedOut = this.getParameterByName('loggedout');

    const self = this;
    if (this.keycloakEnabled) {
      // Bootup KC
      this.keycloakEnabled = true;

      // TODO fix caching issue improved handling of client id
      const keycloak_client_id = window.localStorage.getItem('from_admin_server--keycloak_clientid_env');

      return new Promise((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: this.keycloakRealm,
          clientId: (_.isEmpty(keycloak_client_id)) ? 'eagle-admin-console' : keycloak_client_id
        };

        // console.log('KC Auth init.');

        self.keycloakAuth = new Keycloak(config);

        self.keycloakAuth.onAuthSuccess = function () {
          // console.log('onAuthSuccess');
        };

        self.keycloakAuth.onAuthError = function () {
          console.log('onAuthError');
        };

        self.keycloakAuth.onAuthRefreshSuccess = function () {
          // console.log('onAuthRefreshSuccess');
        };

        self.keycloakAuth.onAuthRefreshError = function () {
          console.log('onAuthRefreshError');
          self.keycloakAuth.login({ idpHint: 'idir' });
        };

        self.keycloakAuth.onAuthLogout = function () {
          // console.log('onAuthLogout');
        };

        // Try to get refresh tokens in the background
        self.keycloakAuth.onTokenExpired = function () {
          self.keycloakAuth.updateToken(180)
            .success(function (refreshed) {
              console.log('KC refreshed token?:', refreshed);
            })
            .error((err) => {
              console.log('onTokenExpired:KC refresh error:', err);
              self.keycloakAuth.login({ idpHint: 'idir' });
            });
        };

        // Initialize.
        self.keycloakAuth.init({})
          .success((auth) => {
            // console.log('KC Refresh Success?:', self.keycloakAuth.authServerUrl);
            console.log('KC Success:', auth);
            if (!auth) {
              if (this.loggedOut === 'true') {
                // Don't do anything, they wanted to remain logged out.
                resolve();
              } else {
                self.keycloakAuth.login({ idpHint: 'idir' });
              }
            } else {
              resolve();
            }
          })
          .error((err) => {
            console.log('KC error2:', err);
            reject();
          });
      });
    }
  }

  isValidForSite() {
    if (!this.getToken()) {
      return false;
    }
    const jwt = new JwtUtil().decodeToken(this.getToken());

    if (jwt && jwt.realm_access && jwt.realm_access.roles) {
      return _.includes(jwt.realm_access.roles, 'sysadmin');
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
    if (!this.keycloakEnabled) {
      // return the local storage token
      const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
      return currentUser ? currentUser.token : null;
    }

    return this.keycloakAuth.token;
  }

  getUserRoles() {
    const jwt = new JwtUtil().decodeToken(this.keycloakAuth.token);
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
    return new Observable(observer => {
      this.keycloakAuth
        .updateToken(30)
        .success(function(refreshed) {
          console.log('KC refreshed token?:', refreshed);
          observer.next();
          observer.complete();
        })
        .error(err => {
          console.log('KC refresh error:', err);
          observer.error();
        });

      return { unsubscribe() {} };
    });
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
