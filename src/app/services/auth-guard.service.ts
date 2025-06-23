import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakService } from './keycloak.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor( private router: Router,
    private keycloakService: KeycloakService, ) {
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.keycloakService.isValidForSite()) {
      return true;
    }
    this.router.navigate(['/not-authorized']);
    return false;
  }
}
