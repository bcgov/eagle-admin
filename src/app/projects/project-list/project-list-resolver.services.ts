import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectListResolver implements Resolve<Object> {

  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params);
    if (tableParams.sortBy === '') {
      tableParams.sortBy = '+name';
      this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, null, tableParams.keywords);
    }
    return this.searchService.getSearchResults(
      tableParams.keywords,
      'Project',
      null,
      tableParams.currentPage,
      tableParams.pageSize,
      tableParams.sortBy,
      null,
      true);
  }
}
