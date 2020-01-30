import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, } from 'rxjs';;

import { ConfigService } from 'app/services/config.service';

@Injectable()
export class ListResolver implements Resolve<Observable<object>> {
  constructor(
    private configService: ConfigService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.configService.getLists();
  }
}
