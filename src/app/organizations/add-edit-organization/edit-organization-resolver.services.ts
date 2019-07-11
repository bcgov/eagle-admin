import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class EditOrganizationResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const orgId = route.paramMap.get('orgId');

    return this.searchService.getItem(orgId, 'Organization')
      .map(res => {
        const organization = res.data;
        return organization ? organization : null;
      })
      .mergeMap(org => {
        if (!org) { return Observable.of(null); }

        if (org.parentCompany === '' || org.parentCompany == null) {
          return Observable.of(org);
        }

        // now get the decision documents
        const promise = this.searchService.getItem(org.parentCompany, 'Organization')
          .toPromise()
          .then(parentCompany => org.parentCompany = parentCompany);

        return Promise.resolve(promise).then(() => {
          return org;
        });
      });
  }
}
