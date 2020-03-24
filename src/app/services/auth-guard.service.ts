import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakService } from 'app/services/keycloak.service';
import { ApiService } from 'app/services/api';


@Injectable()
export class AuthGuard implements CanActivate {
  private _api: ApiService;

  constructor( private router: Router,
    private keycloakService: KeycloakService,
    private api: ApiService, ) {
      this._api = api;
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.api.env === 'local'){
      return true;
    }
    if (this.keycloakService.isValidForSite()) {
      return true;
    }
    this.router.navigate(['/not-authorized']);
    return false;
  }
}
