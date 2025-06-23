import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs/Observable';
import { Org } from '../models/org';

@Injectable({
  providedIn: 'root'
})
export class OrgService {

  constructor(
    private api: ApiService
  ) { }

  save(org: Org): Observable<Org> {
    return this.api.saveOrg(org)
      .catch(error => this.api.handleError(error));
  }

  add(org: Org): Observable<Org> {
    return this.api.addOrg(org)
      .catch(error => this.api.handleError(error));
  }

  getByCompanyType(type: string): Observable<Org[]> {
    return this.api.getOrgsByCompanyType(type)
      .map((res: any) => {
        if (res) {
          const orgs = res;
          orgs.forEach((org, index) => {
            orgs[index] = new Org(org);
          });
          return orgs;
        }
      })
      .catch(error => this.api.handleError(error));
  }
}
