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
    // When a successful login occurs, we store the identity provider used in localStorage.
    const lastIdp = localStorage.getItem(
      this.keycloakService.LAST_IDP_AUTHENTICATED
    );
    const redirectKey = this.configService.config().REDIRECT_KEY || 'REDIRECT';
    
    // Not authenticated
    if (!this.keycloakService.isAuthenticated()) {
      // Cleared first, so a failed attempt with a stale provider falls back to IDIR next time.
      localStorage.removeItem(this.keycloakService.LAST_IDP_AUTHENTICATED);
      localStorage.setItem(redirectKey, window.location.href);
      this.keycloakService.login(lastIdp ?? this.keycloakService.idpHintEnum.IDIR);
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