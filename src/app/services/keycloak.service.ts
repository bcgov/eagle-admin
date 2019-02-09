import { Injectable } from '@angular/core';
import { JwtUtil } from 'app/jwt-util';
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

    const url = window.location.href;
    this.loggedOut = this.getParameterByName('loggedout');

    const self = this;
    if (this.keycloakEnabled) {
      // Bootup KC
      this.keycloakEnabled = true;
      return new Promise((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: this.keycloakRealm,
          clientId: 'eagle-admin-console'
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
        };

        self.keycloakAuth.onAuthLogout = function () {
          // console.log('onAuthLogout');
        };

        // Try to get refresh tokens in the background
        self.keycloakAuth.onTokenExpired = function () {
          console.log('onTokenExpired, attempting to refresh.');
          self.keycloakAuth.updateToken()
            .success(function (auth) {
              console.log('KC Refresh Success?:', auth);
            })
            .error((err) => {
              console.log('KC error1:', err);
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

  getToken(): string {
    // console.log('getToken:', this.keycloakAuth);
    if (this.keycloakEnabled) {
      return this.keycloakAuth.token; // returns undefined if present
    } else {
      // return the local storage token
      const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
      return currentUser ? currentUser.token : null;
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
