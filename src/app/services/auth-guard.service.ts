import { Router, UrlTree } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private readonly keycloakService = inject(KeycloakService);
  private readonly router = inject(Router);
  private readonly configService = inject(ConfigService);

  canActivate(
  ): boolean | UrlTree {
    const redirectKey = this.configService.config().REDIRECT_KEY || 'REDIRECT';

    if (!this.keycloakService.isAuthenticated()) {
      localStorage.setItem(redirectKey, window.location.href);
      this.keycloakService.login(this.keycloakService.idpHintEnum.IDIR);
      return false;
    } else {
      localStorage.removeItem(redirectKey);
    }

    // Not authorized / feature flagged
    if (!this.keycloakService.isAuthorized()) {
      // login was successful but the user doesn't have necessary Keycloak roles.
      return this.router.parseUrl('/not-authorized');
    }

    // Show the requested page.
    return true;
  }
}