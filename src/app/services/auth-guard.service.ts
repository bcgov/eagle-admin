import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakService } from 'app/services/keycloak.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor( private router: Router,
    private keycloakService: KeycloakService, ) {
  }

  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.keycloakService.isValidForSite()) {
      return true;
    }
    this.router.navigate(['/not-authorized']);
    return false;
  }
}
