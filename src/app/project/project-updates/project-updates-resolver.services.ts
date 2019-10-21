import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectUpdatesResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = route.params.currentPage ? route.params.currentPage : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy ? route.params.sortBy : '-datePosted';
    const keywords = route.params.keywords || '';
    return this.searchService.getSearchResults(
      keywords,
      'RecentActivity',
      [{ 'name': 'project', 'value': projectId }],
      pageNum,
      pageSize,
      '',
      sortBy,
      {},
      true);
  }
}
