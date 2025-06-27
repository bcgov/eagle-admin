import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';

@Injectable()
export class PinsGlobalComponentResolver  {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const pageNum = route.params.currentPage ? route.params.currentPage : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
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
