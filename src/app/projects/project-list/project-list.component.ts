import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { DEMI_MAX_PAGE_SIZE, DemiList } from 'src/app/models/demi/demi-list';
import { Proponent } from 'src/app/models/demi/organization';
import { DemiProject, PCP_FILTER, PROJECT_FILTERS, PROJECT_SORT_KEYS, ProjectFilter } from 'src/app/models/demi/project';
import { LegacyProject, toLegacyProject } from 'src/app/models/demi/project-legacy';
import { SearchTerms } from 'src/app/models/search';
import { ConfigService } from 'src/app/services/config.service';
import { DemiApiService } from 'src/app/services/demi-api.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { Constants } from 'src/app/shared/utils/constants';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils, nextSortBy, nativeSort } from 'src/app/shared/utils/table-template-utils';
import { filterCompareWith, isNgbDate, isoToNgbDate, ngbDateToIso } from 'src/app/shared/utils/utils';
import { ProjectListTableRowsComponent } from './project-list-table-rows/project-list-table-rows.component';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { LoggingService } from 'src/app/services/logging.service';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';

class ProjectFilterObject {
  constructor(
    public type: Array<any> = [],
    public eacDecision: Array<any> = [],
    public decisionDateStart: object = {},
    public decisionDateEnd: object = {},
    public proponent: Array<any> = [],
    public region: Array<any> = [],
    public CEAAInvolvement: Array<any> = [],
    public projectPhase: Array<any> = [],
    public pcp: Array<any> = [],
  ) { }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
  imports: [
    FormsModule,
    NgSelectModule,
    TableTemplateComponent,
    NgbDatepickerModule
  ],
})
export class ProjectListComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private navigationStackUtils = inject(NavigationStackUtils);
  private demiApi = inject(DemiApiService);
  private projectService = inject(ProjectService);
  private storageService = inject(StorageService);
  private configService = inject(ConfigService);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggingService);
  public loadingState = inject(LoadingStateService);
  public loading = this.loadingState.getOperationState('project-list');

  public readonly constants = Constants;
  public projects: LegacyProject[] = [];
  public proponents: Proponent[] = [];
  public regions: Array<any> = [];
  public ceaaInvolvements: Array<object> = [];
  public eacDecisions: Array<object> = [];
  public projectTypes: Array<object> = [];
  public projectPhases: Array<object> = [];
  public readonly commentPeriods = Constants.PCP_COLLECTION;
  public placeholderDateRangeModel: Array<object>;
  public dateRangeItems: Array<object> = [{}];

  public tableParams: TableParamsObject = new TableParamsObject();
  public terms = new SearchTerms();

  public filterForURL: object = {};
  /** Filters as DEMI `/projects` names them, from the last submitted URL. */
  public filterForAPI: Record<string, string | string[]> = {};

  public filterForUI: ProjectFilterObject = new ProjectFilterObject();

  showAdvancedSearch = signal(false);

  public showFilters: object = {
    type: false,
    eacDecision: false,
    pcp: false
  };

  public numFilters: object = {
    type: 0,
    eacDecision: 0,
    pcp: 0
  };

  public projectTableData: TableObject;
  public projectTableColumns: TableColumn[] = [
    {
      name: 'Name',
      value: 'name',
      width: '20%'
    },
    {
      name: 'Proponent',
      value: 'proponentName',
      width: '20%'
    },
    {
      name: 'Type',
      value: 'projectType',
      width: '15%'
    },
    {
      name: 'Region',
      value: 'region',
      width: '15%'
    },
    {
      name: 'Phase',
      value: 'currentPhaseName.name',
      width: '15%'
    },
    {
      name: 'Decision',
      value: 'eacDecisionSort',
      width: '15%'
    }
  ];

  ngOnInit() {
    this.projectTypes = Constants.PROJECT_TYPE_COLLECTION;
    this.getLists();
    this.loadProponents()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(proponents => {
          this.proponents = proponents;
          return this.route.params;
        }),
        switchMap((res: any) => {
          const params = { ...res };
          this.setFiltersFromParams(params);
          this.updateCounts();
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(
            params,
            this.filterForURL
          );
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '+name';
            this.tableTemplateUtils.updateUrl(
              this.tableParams.sortBy,
              this.tableParams.currentPage,
              this.tableParams.pageSize,
              this.filterForURL,
              this.tableParams.keywords
            );
          }
          return this.fetchProjects();
        }),
      )
      .subscribe({
        next: page => this.showPage(page),
        error: (error: any) => {
          this.logger.error('Failed to load projects', 'ProjectListComponent', error);
        }
      });
  }

  /** Proponent picker options. A failure leaves the picker empty rather than blocking the list. */
  private loadProponents(): Observable<Proponent[]> {
    return this.demiApi.list<Proponent>('organizations', {
      sort: 'name',
      pageSize: DEMI_MAX_PAGE_SIZE,
      filters: { companyType: 'Proponent/Certificate Holder' }
    }).pipe(
      map(page => page.rows),
      catchError(error => {
        this.logger.error('Failed to load proponents', 'ProjectListComponent', error);
        return of([]);
      })
    );
  }

  private fetchProjects(): Observable<DemiList<DemiProject>> {
    return this.projectService.list({
      page: this.tableParams.currentPage,
      pageSize: this.tableParams.pageSize,
      sort: nativeSort(this.tableParams.sortBy, 'name', PROJECT_SORT_KEYS),
      q: this.tableParams.keywords || undefined,
      filters: this.filterForAPI
    }).pipe(withLoading(this.loadingState, 'project-list'));
  }

  private showPage(page: DemiList<DemiProject>) {
    this.tableParams.totalListItems = page.total ?? 0;
    this.projects = page.rows.map(toLegacyProject);
    this.setRowData();
  }

  addProject() {
    this.navigationStackUtils.clearNavigationStack();
    this.storageService.state.tableColumns = null;
    this.storageService.state.sortBy = null;
    this.storageService.state.form2018 = null;
    this.storageService.state.form2002 = null;
    this.storageService.state.selectedContactType = null;
    this.storageService.state.componentModel = null;
    this.storageService.state.rowComponent = null;
    this.router.navigate(['/projects', 'add', 'form-2018']);
  }

  /** Reads `name` from the URL; sends each picked record's `apiKey` to DEMI as `api`. */
  paramsToCollectionFilters(params, name: string, collection: any[], { by, api, apiKey }: ProjectFilter) {
    this.filterForUI[name] = [];
    delete this.filterForURL[name];
    delete this.filterForAPI[api];

    if (params[name] && collection) {
      const records = params[name].split(',')
        .map(value => collection.find(item => item[by] === value))
        .filter(Boolean);
      if (records.length) {
        this.filterForUI[name] = records;
        this.filterForURL[name] = records.map(r => r[by]).join(',');
        this.filterForAPI[api] = records.map(r => r[apiKey]);
      }
    }
  }

  /** Picker options for each of {@link PROJECT_FILTERS}. */
  private filterItems(): Record<keyof typeof PROJECT_FILTERS, any[]> {
    return {
      region: this.regions,
      CEAAInvolvement: this.ceaaInvolvements,
      proponent: this.proponents,
      eacDecision: this.eacDecisions,
      type: this.projectTypes,
      projectPhase: this.projectPhases
    };
  }

  paramsToDateFilters(params, name) {
    this.filterForUI[name] = null;
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    const date = isoToNgbDate(params[name]);
    if (date) {
      this.filterForURL[name] = this.filterForAPI[name] = ngbDateToIso(date);
      this.filterForUI[name] = date;
    }
  }

  setFiltersFromParams(params) {
    const items = this.filterItems();
    for (const [name, filter] of Object.entries(PROJECT_FILTERS)) {
      this.paramsToCollectionFilters(params, name, items[name], filter);
    }
    this.paramsToCollectionFilters(params, 'pcp', this.commentPeriods, PCP_FILTER);

    this.paramsToDateFilters(params, 'decisionDateStart');
    this.paramsToDateFilters(params, 'decisionDateEnd');
  }

  collectionFilterToParams(params, name, identifyBy) {
    if (this.filterForUI[name].length) {
      const values = this.filterForUI[name].map(record => {
        return record[identifyBy];
      });
      params[name] = values.join(',');
    }
  }

  dateFilterToParams(params, name) {
    const iso = ngbDateToIso(this.filterForUI[name]);
    if (iso) {
      params[name] = iso;
    }
  }

  setParamsFromFilters(params) {
    for (const [name, filter] of Object.entries(PROJECT_FILTERS)) {
      this.collectionFilterToParams(params, name, filter.by);
    }
    this.collectionFilterToParams(params, 'pcp', PCP_FILTER.by);

    this.dateFilterToParams(params, 'decisionDateStart');
    this.dateFilterToParams(params, 'decisionDateEnd');
  }

  toggleFilter(name) {
    if (this.showFilters[name]) {
      this.updateCount(name);
      this.showFilters[name] = false;
    } else {
      Object.keys(this.showFilters).forEach(key => {
        if (this.showFilters[key]) {
          this.updateCount(key);
          this.showFilters[key] = false;
        }
      });
      this.showFilters[name] = true;
    }
  }

  isShowingFilter() {
    return Object.keys(this.showFilters).some(key => {
      return this.showFilters[key];
    });
  }

  clearAll() {
    Object.keys(this.filterForUI).forEach(key => {
      if (this.filterForUI[key]) {
        if (Array.isArray(this.filterForUI[key])) {
          this.filterForUI[key] = [];
        } else if (typeof this.filterForUI[key] === 'object') {
          this.filterForUI[key] = {};
        } else {
          this.filterForUI[key] = '';
        }
      }
    });
    this.clearDateRange();
    this.updateCounts();
  }

  isUiFiltered() {
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

  updateCount(name) {
    const getCount = n => {
      return Object.keys(this.filterForUI[n]).filter(
        k => this.filterForUI[n][k]
      ).length;
    };

    let num = 0;
    if (name === 'eacDecision') {
      num = getCount(name);
      num += isNgbDate(this.filterForUI.decisionDateStart) ? 1 : 0;
      num += isNgbDate(this.filterForUI.decisionDateEnd) ? 1 : 0;
    } else {
      num = getCount(name);
    }
    this.numFilters[name] = num;
  }

  updateCounts() {
    this.updateCount('type');
    this.updateCount('eacDecision');
    this.updateCount('projectPhase');
    this.updateCount('pcp');
  }

  setRowData() {
    const projectList = [];
    if (this.projects && this.projects.length > 0) {
      this.projects.forEach(project => {
        projectList.push({
          // Track-only rows have no Eagle id; the project route also takes the DEMI id.
          _id: project._id ?? project.demiId,
          name: project.name,
          proponent: project.proponent,
          type: project.type,
          region: project.region,
          currentPhaseName: project.currentPhaseName,
          eacDecision: project.eacDecision
        });
      });
      this.projectTableData = new TableObject(
        ProjectListTableRowsComponent,
        projectList,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.getPaginatedProjects(1);
  }

  getPaginatedProjects(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.tableParams = this.tableTemplateUtils.updateTableParams(
      this.tableParams,
      pageNumber,
      this.tableParams.sortBy
    );

    this.fetchProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: page => {
          this.tableTemplateUtils.updateUrl(
            this.tableParams.sortBy,
            this.tableParams.currentPage,
            this.tableParams.pageSize,
            this.filterForURL,
            this.tableParams.keywords
          );
          this.showPage(page);
        },
        error: (error: any) => {
          this.logger.error('Failed to load projects', 'ProjectListComponent', error);
        }
      });
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = currentPage;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize;

    this.setParamsFromFilters(params);

    this.router.navigate(['projects', params]);
  }

  getLists() {
    this.configService.lists.map(item => {
      switch (item.type) {
        case 'eaDecisions':
          this.eacDecisions.push({ ...item });
          break;
        case 'ceaaInvolvements':
          this.ceaaInvolvements.push({ ...item });
          break;
        case 'projectPhase':
          this.projectPhases.push({ ...item });
          break;
        case 'region':
          this.regions.push({ ...item });
          break;
        default:
          break;
      }
    });

    // Sorts by legislation first and then listOrder for each legislation group.
    this.eacDecisions = this.eacDecisions.sort((a, b) => {
      if (a["legislation"] === b["legislation"]) {
        return (a["listOrder"] || 0) - (b["listOrder"] || 0);
      }
      if (a["legislation"] < b["legislation"]) return -1;
      if (a["legislation"] > b["legislation"]) return 1;
      return 0;
    });
    this.ceaaInvolvements = this.ceaaInvolvements.sort((a, b) => {
      if (a["legislation"] === b["legislation"]) {
        return (a["listOrder"] || 0) - (b["listOrder"] || 0);
      }
      if (a["legislation"] < b["legislation"]) return -1;
      if (a["legislation"] > b["legislation"]) return 1;
      return 0;
    });
    this.projectPhases = this.projectPhases.sort((a, b) => {
      if (a["legislation"] === b["legislation"]) {
        return (a["listOrder"] || 0) - (b["listOrder"] || 0);
      }
      if (a["legislation"] < b["legislation"]) return -1;
      if (a["legislation"] > b["legislation"]) return 1;
      return 0;
    });
    this.regions = this.regions.sort((a, b) => {
      if (a["legislation"] === b["legislation"]) {
        return (a["listOrder"] || 0) - (b["listOrder"] || 0);
      }
      if (a["legislation"] < b["legislation"]) return -1;
      if (a["legislation"] > b["legislation"]) return 1;
      return 0;
    });
  }

  // Compares selected options when a dropdown is grouped by legislation.
  compareDropdownOptions(optionA: any, optionB: any) {
    if ((optionA.name === optionB.name) && (optionA.legislation === optionB.legislation)) {
      return true;
    }

    return false;
  }

  // If date is cleared and other date in range is not set clear placeholder model
  changeDate(event: any, date: string) {
    if (date === 'start') {
      this.filterForUI.decisionDateStart = event;
      if (event === null && (this.filterForUI.decisionDateEnd === null || Object.keys(this.filterForUI.decisionDateEnd).length === 0)) {
        this.clearDateRange();
        this.placeholderDateRangeModel = [];
      }
    } else if (date === 'end') {
      this.filterForUI.decisionDateEnd = event;
      if (event === null && (this.filterForUI.decisionDateStart === null || Object.keys(this.filterForUI.decisionDateStart).length === 0)) {
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
    this.filterForUI.decisionDateEnd = {};
    this.filterForUI.decisionDateStart = {};
    this.placeholderDateRangeModel = [];
  }

  isDateRangeSet() {
    return isNgbDate(this.filterForUI.decisionDateStart) || isNgbDate(this.filterForUI.decisionDateEnd);
  }

  clearSelectedItem(filterType: string, item: any) {
    this.logger.debug('clear selected items', 'ProjectListComponent', { filterType, item });
    if (filterType === 'eacDecision' || filterType === 'projectPhase' || filterType === 'CEAAInvolvement') {
      this.filterForUI[filterType] = this.filterForUI[filterType].filter(option => option.id !== item.id);
    } else {
      this.filterForUI[filterType] = this.filterForUI[filterType].filter(option => option.name !== item.name);
    }
  }

  public readonly filterCompareWith = filterCompareWith;

}
