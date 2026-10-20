import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { ActivityTableRowsComponent } from './activity-table-rows/activity-table-rows.component';
import { DEMI_MAX_PAGE_SIZE } from '../models/demi/demi-list';
import { DemiUpdate, UPDATE_SORT_KEYS } from '../models/demi/update';
import { LegacyProject, toLegacyProject } from '../models/demi/project-legacy';
import { SearchTerms } from '../models/search';
import { ProjectService } from '../services/project.service';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';
import { UPDATE_LIST_ERROR_MESSAGE } from './update-rules';
import { RecentActivityService } from '../services/recent-activity';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { Constants } from '../shared/utils/constants';
import { TableTemplateUtils, nativeSort, nextSortBy, tableSort } from '../shared/utils/table-template-utils';
import { filterCompareWith, isoToNgbDate, ngbDateToIso } from '../shared/utils/utils';
import { DateRange, DateRangeFilterComponent } from '../shared/components/date-range-filter/date-range-filter.component';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';

import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

type ActivityType = (typeof Constants.activityTypes)[number];

/** DEMI matches at most this many `project` values. */
const MAX_PROJECT_FILTERS = 100;

class ActivityFilterObject {
  constructor(
    public type: ActivityType[] = [],
    public project: LegacyProject[] = [],
    public dateAddedStart: NgbDateStruct | null = null,
    public dateAddedEnd: NgbDateStruct | null = null,
    public complianceAndEnforcement = false,
  ) { }
}

/** `/updates` filters by DEMI name. */
type UpdateFilters = {
  project?: string[];
  type?: string[];
  dateAddedStart?: string;
  dateAddedEnd?: string;
  complianceAndEnforcement?: 'true';
};

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgSelectModule, DateRangeFilterComponent, TableTemplateComponent, RouterModule]

})
export class ActivityComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private recentActivityService = inject(RecentActivityService);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggingService);
  private toastService = inject(ToastService);
  public readonly maxProjectFilters = MAX_PROJECT_FILTERS;
  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public entries: DemiUpdate[] = null;
  public terms = new SearchTerms();
  public searchForm = null;
  /** Projects an update can point at: those with an Eagle id. */
  public projects: LegacyProject[] = [];
  public activityTypes: ActivityType[] = [];

  public filterForURL: object = {};
  public filterForAPI: UpdateFilters = {};

  public filterForUI: ActivityFilterObject = new ActivityFilterObject();
  public readonly dateRange = new DateRange(() => this.filterForUI, 'dateAddedStart', 'dateAddedEnd');

  public tableColumns: TableColumn[] = [
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
      value: 'projectName',
      width: '20%',
      nosort: true
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
      value: 'status',
      width: '8%'
    },
    {
      name: 'Archive',
      width: '5%',
      nosort: true
    }
  ];

  constructor() {
    this.projectService.list({ pageSize: DEMI_MAX_PAGE_SIZE })
        .pipe(
          switchMap(page => {
            this.projects = page.rows.map(toLegacyProject).filter(project => project._id);
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
            const sort = nativeSort(this.tableParams.sortBy, '-dateAdded', UPDATE_SORT_KEYS);
            this.tableParams.sortBy = tableSort(sort);
            return this.recentActivityService.list({
              page: this.tableParams.currentPage,
              pageSize: this.tableParams.pageSize,
              sort,
              q: this.tableParams.keywords || undefined,
              filters: this.filterForAPI
            });
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: page => {
            this.tableParams.totalListItems = page.total ?? 0;
            this.entries = page.rows;
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.markForCheck();
          },
          error: error => {
            this.logger.error('Update list failed', 'ActivityComponent', error);
            this.toastService.error(UPDATE_LIST_ERROR_MESSAGE);
            this.router.navigate(['/search']);
          }
        });
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
    if (this.entries?.length) {
      this.tableData = new TableObject(ActivityTableRowsComponent, this.entries, this.tableParams);
    }
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.onSubmit(1);
  }

  public onSubmit(pageNumber = 1) {
    // Angular Router ignores navigation to the current URL;
    // the `ms` param changes the URL so the list reloads.
    this.loading = true;
    this._changeDetectionRef.markForCheck();

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize;

    this.setParamsFromFilters(params);
    this.router.navigate(['activity', params]);
  }

  setParamsFromFilters(params) {
    this.collectionFilterToParams(params, 'project', '_id');
    this.collectionFilterToParams(params, 'type', 'code');
    for (const name of ['dateAddedStart', 'dateAddedEnd']) {
      const iso = ngbDateToIso(this.filterForUI[name]);
      if (iso) {
        params[name] = iso;
      }
    }
    if (this.filterForUI.complianceAndEnforcement) {
      params['complianceAndEnforcement'] = 'true';
    }
  }

  collectionFilterToParams(params, name, identifyBy) {
    if (this.filterForUI[name].length) {
      params[name] = this.filterForUI[name].map(record => record[identifyBy]).join(',');
    }
  }

  /** Keeps the URL values found in `collection`; returns the matching records. */
  paramsToCollectionFilters<T>(params, name: string, collection: T[], identifyBy: string): T[] {
    delete this.filterForURL[name];
    const records = (params[name]?.split(',') ?? [])
      .map(value => collection.find(item => item[identifyBy] === value))
      .filter(Boolean);
    if (records.length) {
      this.filterForURL[name] = records.map(record => record[identifyBy]).join(',');
    }
    return records;
  }

  /** Keeps a valid `YYYY-MM-DD` URL date; returns it for the picker. */
  private paramsToDateFilter(params, name: 'dateAddedStart' | 'dateAddedEnd'): NgbDateStruct | null {
    const date = isoToNgbDate(params[name]);
    if (date) {
      this.filterForURL[name] = ngbDateToIso(date);
    } else {
      delete this.filterForURL[name];
    }
    return date;
  }

  setFiltersFromParams(params) {
    // DEMI filters updates by the parent's Eagle id and by type name.
    this.filterForUI.project = this.paramsToCollectionFilters(params, 'project', this.projects, '_id').slice(0, MAX_PROJECT_FILTERS);
    this.filterForUI.type = this.paramsToCollectionFilters(params, 'type', this.activityTypes, 'code');
    this.filterForUI.dateAddedStart = this.paramsToDateFilter(params, 'dateAddedStart');
    this.filterForUI.dateAddedEnd = this.paramsToDateFilter(params, 'dateAddedEnd');
    this.filterForUI.complianceAndEnforcement = params.complianceAndEnforcement === 'true';
    if (this.filterForUI.complianceAndEnforcement) {
      this.filterForURL['complianceAndEnforcement'] = 'true';
    } else {
      delete this.filterForURL['complianceAndEnforcement'];
    }
    this.filterForAPI = {
      project: this.filterForUI.project.length ? this.filterForUI.project.map(project => project._id) : undefined,
      type: this.filterForUI.type.length ? this.filterForUI.type.map(type => type.name) : undefined,
      dateAddedStart: this.filterForURL['dateAddedStart'],
      dateAddedEnd: this.filterForURL['dateAddedEnd'],
      complianceAndEnforcement: this.filterForUI.complianceAndEnforcement ? 'true' : undefined
    };
  }

  clearSelectedItem(filter: string, item: any) {
    this.filterForUI[filter] = this.filterForUI[filter].filter(option => option !== item);
  }

  isUiFiltered() {
    return this.filterForUI.project.length > 0 || this.filterForUI.type.length > 0
      || this.dateRange.isSet() || this.filterForUI.complianceAndEnforcement;
  }

  clearAll() {
    this.filterForUI = new ActivityFilterObject();
    this.dateRange.clear();
  }

  public readonly filterCompareWith = filterCompareWith;
}
