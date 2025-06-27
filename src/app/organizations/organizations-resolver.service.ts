import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from '../services/search.service';
import { StorageService } from '../services/storage.service';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';

@Injectable()
export class OrganizationsResolver  {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let tableParams;
    if (this.storageService.state.orgTableParams) {
      tableParams = this.storageService.state.orgTableParams;
    } else {
      tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, null, null, ['companyType']);
      if (tableParams.sortBy === '') {
        tableParams.sortBy = '+name';
      }
      this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, tableParams.filter, tableParams.keywords);
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
      tableParams.sortBy,
      {},
      false,
      filterObj,
      ''
    );
  }

  getfiltersForApi(typeFilterString) {
    const typeFiltersFromRoute = typeFilterString.split(',');
    const typeFiltersForApi = [];

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
