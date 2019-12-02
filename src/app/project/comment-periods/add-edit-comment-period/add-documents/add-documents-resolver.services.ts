import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class AddDocumentsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    let projectId;
    if (this.storageService.state.currentProject) {
      projectId = this.storageService.state.currentProject.data._id;
    } else {
      projectId = route.parent.parent.params.projId;
    }

    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : 1);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 10);
    const sortBy = route.queryParams['sortBy'] ? route.queryParams['sortBy'] : null;
    const keywords = route.params.keywords;
    return this.searchService.getSearchResults(keywords,
      'Document',
      [{ 'name': 'project', 'value': projectId }],
      pageNum,
      pageSize,
      sortBy,
      { documentSource: 'PROJECT' },
      false,
      {},
      '');
  }
}
