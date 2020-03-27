import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Injectable()
export class ActivityComponentResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const activity = route.paramMap.get('activityId');
    if (activity) {
      return this.searchService.getItem(activity, 'RecentActivity');
    } else {
      // this.filterForUrl.dateAddedStart = route.params.dateAddedStart == null || route.params.dateAddedStart === '' ? '' : route.params.dateAddedStart;
      // this.filterForUrl.dateAddedEnd = route.params.dateAddedEnd == null || route.params.dateAddedEnd === '' ? '' : route.params.dateAddedEnd;

      let filter = {};
      let filterForApi = {};
      if (route.params.type != null) {
        filter['type'] = route.params.type;
        let typeFiltersFromRoute = route.params.type.split(',');
        let typeFiltersForApi = [];
        if (typeFiltersFromRoute.includes('publicCommentPeriod')) { typeFiltersForApi.push('Public Comment Period'); }
        if (typeFiltersFromRoute.includes('news')) { typeFiltersForApi.push('News'); }
        if (typeFiltersForApi.length > 0) { filterForApi = { 'type': typeFiltersForApi.toString() }; }
      }

      let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, filter);
      if (tableParams.sortBy === '') {
        tableParams.sortBy = '-dateAdded';
        this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, filter, tableParams.keywords);
      }
      return this.searchService.getSearchResults(
        tableParams.keywords || '',
        'RecentActivity',
        null,
        tableParams.currentPage,
        tableParams.pageSize,
        tableParams.sortBy,
        {},
        true,
        filterForApi, '');
    }
  }
}
