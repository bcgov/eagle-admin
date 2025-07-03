import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { Org } from '../models/org';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrgService {
  private api = inject(ApiService);


  save(org: Org): Observable<Org> {
    return this.api.saveOrg(org).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  add(org: Org): Observable<Org> {
    return this.api.addOrg(org).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  getByCompanyType(type: string): Observable<Org[]> {
    return this.api.getOrgsByCompanyType(type).pipe(
      map((res: any) => {
        if (res) {
          const orgs = res;
          orgs.forEach((org, index) => {
            orgs[index] = new Org(org);
          });
          return orgs;
        }
      }),
      catchError(error => this.api.handleError(error))
    );
  }
}
