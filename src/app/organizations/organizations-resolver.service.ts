import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class OrganizationsResolver implements Resolve<object> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let tableParams;
    if (this.storageService.state.orgTableParams) {
      tableParams = this.storageService.state.orgTableParams;
      this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, tableParams.filter, tableParams.keywords);
    } else {
      tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, null, null, ['companyType']);
    }

    let filterObj = {};
    if (tableParams.filter && tableParams.filter.companyType) {
      filterObj = this.getfiltersForApi(tableParams.filter.companyType);
    }

    return this.searchService.getSearchResults(
      tableParams.keywords || '',
      'Organization',
      null,
      tableParams.currentPage,
      tableParams.pageSize,
      '',
      tableParams.sortBy,
      {},
      false,
      filterObj
    );
  }

  getfiltersForApi(typeFilterString) {
    let typeFiltersFromRoute = typeFilterString.split(',');
    let typeFiltersForApi = [];

    if (typeFiltersFromRoute.includes('indigenousGroup')) {
      typeFiltersForApi.push('Indigenous Group');
    }
    if (typeFiltersFromRoute.includes('proponent')) {
      typeFiltersForApi.push('Proponent/Certificate Holder');
    }
    if (typeFiltersFromRoute.includes('otherAgency')) {
      typeFiltersForApi.push('Other Agency');
    }
    if (typeFiltersFromRoute.includes('localGovernment')) {
      typeFiltersForApi.push('Local Government');
    }
    if (typeFiltersFromRoute.includes('municipality')) {
      typeFiltersForApi.push('Municipality');
    }
    if (typeFiltersFromRoute.includes('ministry')) {
      typeFiltersForApi.push('Ministry');
    }
    if (typeFiltersFromRoute.includes('consultant')) {
      typeFiltersForApi.push('Consultant');
    }
    if (typeFiltersFromRoute.includes('otherGovernment')) {
      typeFiltersForApi.push('Other Government');
    }
    if (typeFiltersFromRoute.includes('communityGroup')) {
      typeFiltersForApi.push('Community Group');
    }
    if (typeFiltersFromRoute.includes('other')) {
      typeFiltersForApi.push('Other');
    }
    return { companyType: typeFiltersForApi.toString() };
  }
}
