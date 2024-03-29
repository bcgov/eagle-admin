import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Constants } from 'app/shared/utils/constants';
import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
import * as _ from 'lodash';

@Injectable()
export class ActivityComponentResolver implements Resolve<Observable<object>> {
  public filterForURL: object = {};
  public filterForAPI: object = {};

  public activityTypes: Array<object>;
  public projects: Array<Project> = [];

  constructor(
    private searchService: SearchService,
    private projectService: ProjectService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const activity = route.paramMap.get('activityId');
    if (activity) {
      return this.searchService.getItem(activity, 'RecentActivity');
    } else {
      return this.projectService.getAll(1, 1000, '+name')
        .switchMap((res: any) => {
          this.projects = res.data || [];
          this.activityTypes = Constants.activityTypes;

          this.setFiltersFromParams(route.params);

          let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, this.filterForURL);
          if (tableParams.sortBy === '') {
            tableParams.sortBy = '-dateAdded';
            this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, this.filterForURL, tableParams.keywords);
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
            this.filterForAPI,
            '');
        });
    }
  }

  paramsToDateFilters(params, name) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];
      this.filterForAPI[name] = params[name];
    }
  }

  paramsToToggleFilters(params, name) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];
      this.filterForAPI[name] = params[name];
    }
  }

  paramsToCollectionFilters(params, name, collection, identifyBy) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name] && collection) {
      let confirmedValues = [];
      // look up each value in collection
      const values = params[name].split(',');
      values.forEach(value => {
        const record = _.find(collection, [ identifyBy, value ]);
        if (record) {
          confirmedValues.push(value);
        }
      });
      if (confirmedValues.length) {
        this.filterForURL[name] = confirmedValues.join(',');
        this.filterForAPI[name] = confirmedValues.join(',');
      }
    }
  }

  setFiltersFromParams(params) {
    this.paramsToCollectionFilters(params, 'project', this.projects, '_id');
    this.paramsToCollectionFilters(params, 'type', this.activityTypes, 'code');
    this.paramsToToggleFilters(params, 'complianceAndEnforcement');
    this.paramsToDateFilters(params, 'dateAddedStart');
    this.paramsToDateFilters(params, 'dateAddedEnd');
  }
}
