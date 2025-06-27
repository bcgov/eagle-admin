import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { TableTemplateUtils } from '../../utils/table-template-utils';

@Injectable()
export class LinkOrganizationResolver {
  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, null, 10);
    if (tableParams.sortBy === '') {
      tableParams.sortBy = '+name';
      this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, null, tableParams.keywords);
    }
    return this.searchService.getSearchResults(
      tableParams.keywords || '',
      'Organization',
      null,
      tableParams.currentPage,
      tableParams.pageSize,
      tableParams.sortBy,
      {},
      false,
      {},
      '');
  }
}
