import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Injectable()
export class ComplianceResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params);
    if (tableParams.sortBy === '' && this.storageService.state.sortBy) {
      tableParams.sortBy = this.storageService.state.sortBy;
    }

    return this.searchService.getSearchResults(
      tableParams.keywords || '',
      'Inspection',
      [{ 'name': 'project', 'value': projectId }],
      tableParams.currentPage,
      tableParams.pageSize,
      tableParams.sortBy,
      {},
      true);


    // if (this.storageService.state.projectDocumentTableParams == null) {
    //   const pageNum = route.params.pageNum ? route.params.pageNum : 1;
    //   const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    //   const sortBy = route.params.sortBy ? route.params.sortBy : '-datePosted';
    //   const keywords = route.params.keywords || '';
    //   return this.searchService.getSearchResults(
    //     keywords,
    //     'Inspection',
    //     [{ 'name': 'project', 'value': projectId }],
    //     pageNum,
    //     pageSize,
    //     sortBy,
    //     {},
    //     true);
    // } else {
    //   return this.searchService.getSearchResults(
    //     this.storageService.state.projectDocumentTableParams.keywords,
    //     'Inspection',
    //     [{ 'name': 'project', 'value': projectId }],
    //     this.storageService.state.projectDocumentTableParams.pageNum,
    //     this.storageService.state.projectDocumentTableParams.pageSize,
    //     this.storageService.state.projectDocumentTableParams.sortBy,
    //     {},
    //     true);
    // }
  }
}
