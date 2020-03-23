import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, } from 'rxjs';

import { ConfigService } from 'app/services/config.service';

@Injectable()
export class ListResolver implements Resolve<Observable<object>> {
  constructor(
    private configService: ConfigService,
  ) { }

  resolve(): Observable<any> {
    return this.configService.getLists();
  }
}
