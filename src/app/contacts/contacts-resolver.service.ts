import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../services/search.service';
import { StorageService } from '../services/storage.service';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';

@Injectable()
export class ContactsResolver  {
  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params);
    if (tableParams.sortBy === '') {
      if (this.storageService.state.sortBy) {
        tableParams.sortBy = this.storageService.state.sortBy;
      } else {
        tableParams.sortBy = '+lastName,+firstName';
        this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, undefined, tableParams.keywords);
      }
    }

    return this.searchService.getSearchResults(
      tableParams.keywords || '',
      'User',
      null,
      tableParams.currentPage,
      tableParams.pageSize,
      tableParams.sortBy,
      {},
      false, {}, '');
  }
}
