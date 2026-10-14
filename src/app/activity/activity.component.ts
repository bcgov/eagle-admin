import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { ActivityTableRowsComponent } from './activity-table-rows/activity-table-rows.component';
import { DemiUpdate, nativeUpdateSort } from '../models/demi/update';
import { LegacyProject, toLegacyProject } from '../models/demi/project-legacy';
import { SearchTerms } from '../models/search';
import { ProjectService } from '../services/project.service';
import { RecentActivityService } from '../services/recent-activity';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { Constants } from '../shared/utils/constants';
import { TableTemplateUtils, nextSortBy } from '../shared/utils/table-template-utils';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';

import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

type ActivityType = (typeof Constants.activityTypes)[number];

class ActivityFilterObject {
  constructor(
    public type: ActivityType[] = [],
    public project: LegacyProject[] = [],
  ) { }
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgSelectModule, TableTemplateComponent, RouterModule]

})
export class ActivityComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private recentActivityService = inject(RecentActivityService);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private destroyRef = inject(DestroyRef);
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
  public filterForAPI: { project?: string; type?: string[] } = {};

  public filterForUI: ActivityFilterObject = new ActivityFilterObject();

  // DEMI sorts updates by date only.
  public tableColumns: TableColumn[] = [
    {
      name: 'Pin',
      value: 'pinned',
      width: '5%',
      nosort: true
    },
    {
      name: 'Headline',
      value: 'headline',
      width: '30%',
      nosort: true
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
      width: '20%',
      nosort: true
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: '12%'
    },
    {
      name: 'Status',
      value: 'status',
      width: '8%',
      nosort: true
    },
    {
      name: 'Archive',
      width: '5%',
      nosort: true
    }
  ];

  constructor() {
    this.projectService.list({ pageSize: 1000 })
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
            const sort = nativeUpdateSort(this.tableParams.sortBy) ?? '-dateAdded';
            this.tableParams.sortBy = sort.startsWith('-') ? sort : `+${sort}`;
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
          error: () => this.router.navigate(['/search'])
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
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
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

  setFiltersFromParams(params) {
    // DEMI filters updates by one project, by its Eagle id, and by type name.
    this.filterForUI.project = this.paramsToCollectionFilters(params, 'project', this.projects, '_id').slice(0, 1);
    this.filterForUI.type = this.paramsToCollectionFilters(params, 'type', this.activityTypes, 'code');
    this.filterForAPI = {
      project: this.filterForUI.project[0]?._id ?? undefined,
      type: this.filterForUI.type.length ? this.filterForUI.type.map(type => type.name) : undefined
    };
  }

  clearSelectedItem(filter: string, item: any) {
    this.filterForUI[filter] = this.filterForUI[filter].filter(option => option !== item);
  }

  isUiFiltered() {
    return this.filterForUI.project.length > 0 || this.filterForUI.type.length > 0;
  }

  clearAll() {
    this.filterForUI = new ActivityFilterObject();
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
}
