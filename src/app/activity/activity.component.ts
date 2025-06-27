import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { ActivityTableRowsComponent } from './activity-table-rows/activity-table-rows.component';
import { Project } from '../models/project';
import { RecentActivity } from '../models/recentActivity';
import { SearchTerms } from '../models/search';
import { ProjectService } from '../services/project.service';
import { TableObject } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { Constants } from '../shared/utils/constants';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';

class ActivityFilterObject {
  constructor(
    public type: Array<object> = [],
    public dateAddedStart: object = {},
    public dateAddedEnd: object = {},
    public project: Array<Project> = [],
    public complianceAndEnforcement: boolean = false,
  ) { }
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent implements OnDestroy {
  private subscriptions = new Subscription();
  public readonly constants = Constants;
  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public entries: RecentActivity[] = null;
  public terms = new SearchTerms();
  public searchForm = null;
  public projects: Array<Project> = [];
  public activityTypes: Array<object> = [];
  public placeholderDateRangeModel: Array<object>;
  public dateRangeItems: Array<object> = [{}];

  public dateRangeSet = false;

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public filterForUI: ActivityFilterObject = new ActivityFilterObject();

  public tableColumns: any[] = [
    {
      name: 'Pin',
      value: 'pinned',
      width: '5%'
    },
    {
      name: 'Headline',
      value: 'headline',
      width: '30%'
    },
    {
      name: 'Project',
      value: 'project.name',
      width: '20%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '20%'
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: '12%'
    },
    {
      name: 'Status',
      value: 'active',
      width: '8%'
    },
    {
      name: 'Delete',
      width: '5%',
      nosort: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
  ) {
    this.subscriptions.add(
      this.projectService.getAll(1, 1000, '+name')
        .pipe(
          switchMap((res: any) => {
            this.projects = res.data || [];
            this.activityTypes = Constants.activityTypes;

            return this.route.params;
          }),
          switchMap((res: any) => {
            const params = { ...res };

            this.setFiltersFromParams(params);

            this.tableParams = this.tableTemplateUtils.getParamsFromUrl(
              params,
              this.filterForURL
            );
            return this.route.data;
          })
        )
        .subscribe((res: any) => {
          if (res) {
            if (res.activities && res.activities[0].data.meta && res.activities[0].data.meta.length > 0) {
              this.tableParams.totalListItems = res.activities[0].data.meta[0].searchResultsTotal;
              this.entries = res.activities[0].data.searchResults;
            } else {
              this.tableParams.totalListItems = 0;
              this.entries = [];
            }
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load valued components');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        })
    );
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'add':
        // Add activity
        this.router.navigate(['/activity', 'add']);
        break;
    }
  }

  setRowData() {
    const list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach(item => {
        list.push(
          {
            _id: item._id,
            project: item.project,
            headline: item.headline,
            type: item.type,
            dateAdded: item.dateAdded,
            active: item.active,
            pinned: item.pinned
          }
        );
      });
      this.tableData = new TableObject(
        ActivityTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  public onSubmit(pageNumber = 1) {
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;
    this._changeDetectionRef.detectChanges();

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy = '';
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize;

    this.setParamsFromFilters(params);
    this.router.navigate(['activity', params]);
  }

  setParamsFromFilters(params) {
    this.collectionFilterToParams(params, 'project', '_id');
    this.collectionFilterToParams(params, 'type', 'code');
    this.toggleFilterToParams(params, 'complianceAndEnforcement');
    this.dateFilterToParams(params, 'dateAddedStart');
    this.dateFilterToParams(params, 'dateAddedEnd');
  }

  collectionFilterToParams(params, name, identifyBy) {
    if (this.filterForUI[name].length) {
      const values = this.filterForUI[name].map(record => {
        return record[identifyBy];
      });
      params[name] = values.join(',');
    }
  }

  toggleFilterToParams(params, name) {
    if (this.filterForUI[name]) {
      params[name] = this.filterForUI[name];
    }
  }

  isNGBDate(date) {
    return date && date.year && date.month && date.day;
  }

  dateFilterToParams(params, name) {
    if (this.isNGBDate(this.filterForUI[name])) {
      const date = new Date(
        this.filterForUI[name].year,
        this.filterForUI[name].month - 1,
        this.filterForUI[name].day
      );
      params[name] = moment(date).format('YYYY-MM-DD');
    }
  }

  paramsToDateFilters(params, name) {
    this.filterForUI[name] = null;
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];
      this.filterForAPI[name] = params[name];
      // NGB Date
      const date = moment(params[name]).toDate();
      this.filterForUI[name] = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
  }

  paramsToToggleFilters(params, name) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForUI[name] = params[name];
      this.filterForAPI[name] = params[name];
    }
  }

  paramsToCollectionFilters(params, name, collection, identifyBy) {
    this.filterForUI[name] = [];
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
          this.filterForUI[name].push(record);
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

  clearSelectedItem(filter: string, item: any) {
    this.filterForUI[filter] = this.filterForUI[filter].filter(option => option._id !== item._id);
  }

  isUiFiltered() {
    if (this.filterForUI.complianceAndEnforcement) {
      return true;
    }
    if (this.isDateRangeSet()) {
      return true;
    } else {
      let count = 0;
      Object.keys(this.filterForUI).forEach(key => {
        if (this.filterForUI[key]) {
          if (Array.isArray(this.filterForUI[key])) {
            count += this.filterForUI[key].length;
          }
        }
      });
      return (count > 0);
    }
  }

  isDateSet(date) {
    return date ? Object.keys(date).length !== 0 : false;
  }

  isDateRangeSet() {
    const startSet = (this.filterForUI.dateAddedStart != null && this.isNGBDate(this.filterForUI.dateAddedStart));
    const endSet = (this.filterForUI.dateAddedEnd != null && this.isNGBDate(this.filterForUI.dateAddedEnd));
    return (startSet || endSet);
  }

  // If date is cleared and other date in range is not set clear placeholder model
  changeDate(event: any, date: string) {
    if (date === 'start') {
      this.filterForUI.dateAddedStart = event;
      if (event === null && (this.filterForUI.dateAddedEnd === null || Object.keys(this.filterForUI.dateAddedEnd).length === 0)) {
        this.clearDateRange();
        this.placeholderDateRangeModel = [];
      }
    } else if (date === 'end') {
      this.filterForUI.dateAddedEnd = event;
      if (event === null && (this.filterForUI.dateAddedStart === null || Object.keys(this.filterForUI.dateAddedStart).length === 0)) {
        this.clearDateRange();
        this.placeholderDateRangeModel = [];
      }
    }
  }

  changeDateRange() {
    // if date range is not set with valid values, clear placeholder model.
    if (this.isDateRangeSet()) {
      this.placeholderDateRangeModel = [{}];
    } else {
      this.placeholderDateRangeModel = [];
    }
  }

  clearDateRange() {
    this.filterForUI.dateAddedEnd = {};
    this.filterForUI.dateAddedStart = {};
    this.placeholderDateRangeModel = [];
  }

  clearCAndE() {
    this.filterForUI.complianceAndEnforcement = false;
  }

  clearAll() {
    Object.keys(this.filterForUI).forEach(key => {
      if (this.filterForUI[key]) {
        if (Array.isArray(this.filterForUI[key])) {
          this.filterForUI[key] = [];
        } else if (typeof this.filterForUI[key] === 'object') {
          this.filterForUI[key] = {};
        } else if (typeof this.filterForUI[key] === 'boolean') {
          this.filterForUI[key] = false;
        }
      }
    });
  }

  public filterCompareWith(filter: any, filterToCompare: any) {
    if (filter.hasOwnProperty('code')) {
      return filter && filterToCompare
        ? filter.code === filterToCompare.code
        : filter === filterToCompare;
    } else if (filter.hasOwnProperty('_id')) {
      return filter && filterToCompare
        ? filter._id === filterToCompare._id
        : filter === filterToCompare;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
