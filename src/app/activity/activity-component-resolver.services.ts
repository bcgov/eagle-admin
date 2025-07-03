import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Project } from '../models/project';
import { ProjectService } from '../services/project.service';
import { SearchService } from '../services/search.service';
import { Constants } from '../shared/utils/constants';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';

@Injectable()
export class ActivityComponentResolver {
  private searchService = inject(SearchService);
  private projectService = inject(ProjectService);
  private tableTemplateUtils = inject(TableTemplateUtils);

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public activityTypes: Array<object>;
  public projects: Array<Project> = [];

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const activity = route.paramMap.get('activityId');
    if (activity) {
      return this.searchService.getItem(activity, 'RecentActivity');
    } else {
      return this.projectService.getAll(1, 1000, '+name')
        .pipe(
          switchMap((res: any) => {
            this.projects = res.data || [];
            this.activityTypes = Constants.activityTypes;

            this.setFiltersFromParams(route.params);

            const tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, this.filterForURL);
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
          })
        );
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
      const confirmedValues = [];
      // look up each value in collection
      const values = params[name].split(',');
      values.forEach(value => {
        const record = collection.find(item => item[identifyBy] === value);
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
