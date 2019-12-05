import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Injectable()
export class PinsGlobalComponentResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const pageNum = route.params.currentPage ? route.params.currentPage : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 25;
    const sortBy = route.params.sortBy ? route.params.sortBy : '+name';
    const keywords = route.params.keywords || '';

    // force-reload so we always have latest data
    return this.searchService.getSearchResults(keywords,
      'Organization',
      [],
      pageNum,
      pageSize,
      sortBy,
      {},
      false,
      { companyType: 'Indigenous Group' },
      '',
    );
  }
}
