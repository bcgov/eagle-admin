import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRoute, CanActivateChild } from '@angular/router';

@Injectable()
export class ActiveTabGuard implements CanActivate {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}
  canActivate(): boolean {
    // console.log('ROUTE', this.route);
    return true;
  }
}
