import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ContactsResolverService implements Resolve<object> {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const pageNum = route.params.currentPage ? route.params.currentPage : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 25;
    const sortBy = route.params.sortBy ? route.params.sortBy : '+displayName';
    const keywords = route.params.keywords;
    let filter = {};

    return this.searchService.getSearchResults(keywords,
                                              'User',
                                              null,
                                              pageNum,
                                              pageSize,
                                              sortBy,
                                              filter);
  }
}
