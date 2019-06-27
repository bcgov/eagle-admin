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

  getById(id: String): Observable<Org> {
    return this.api.getOrg(id)
      .map((org: any) => {
        // return the first (only) project
        return org.length > 0 ? new Org(org[0]) : null;
      })
      .catch(error => this.api.handleError(error));
  }
}
