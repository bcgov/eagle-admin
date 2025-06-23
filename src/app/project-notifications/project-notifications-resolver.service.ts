import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../services/search.service';
import { StorageService } from '../services/storage.service';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';

@Injectable()
export class ProjectNotificationsResolver implements Resolve<object> {
  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params);
    if (tableParams.sortBy === '' && this.storageService.state.sortBy) {
      tableParams.sortBy = this.storageService.state.sortBy;
    }

    if (tableParams.sortBy === '') {
      tableParams.sortBy = '-_id';
    }

    return this.searchService.getSearchResults(
      tableParams.keywords || '',
      'ProjectNotification',
      null,
      tableParams.currentPage,
      tableParams.pageSize,
      tableParams.sortBy,
      {});
  }
}
