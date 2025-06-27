import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';

@Injectable()
export class EditOrganizationResolver {
  constructor(
    private searchService: SearchService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const orgId = route.paramMap.get('orgId');

    return this.searchService.getItem(orgId, 'Organization').pipe(
      map(res => {
        const organization = res.data;
        return organization ? organization : null;
      }),
      mergeMap(org => {
        if (!org) { return of(null); }

        if (org.parentCompany === '' || org.parentCompany == null) {
          return of(org);
        }
        // now get the decision documents
        const promise = firstValueFrom(this.searchService.getItem(org.parentCompany, 'Organization'))
          .then(parentCompany => org.parentCompany = parentCompany);

        return Promise.resolve(promise).then(() => {
          return org;
        });
      })
    )
  }
}
