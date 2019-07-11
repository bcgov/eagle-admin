import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Org } from 'app/models/org';
import { Observable } from 'rxjs/Observable';

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
}
