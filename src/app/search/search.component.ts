import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, inject, DestroyRef, signal, afterRenderEffect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from 'src/app/services/toast.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { Observable, Subject, of } from 'rxjs';

import { catchError, finalize, map, switchMap, timeout } from 'rxjs/operators';

import { DateTime } from 'luxon';
import { DEMI_MAX_PAGE_SIZE, DemiList } from '../models/demi/demi-list';
import { DemiDocument } from '../models/demi/document';
import { Proponent } from '../models/demi/organization';
import { DemiProject, PROJECT_FILTERS, PROJECT_SORT_KEYS } from '../models/demi/project';
import { toLegacyProject } from '../models/demi/project-legacy';
import { SearchTerms } from '../models/search';
import { nativeDocumentSort } from '../project/project-documents/document-edit/legacy-document-row';
import { ProjectListTableRowsComponent } from '../projects/project-list/project-list-table-rows/project-list-table-rows.component';
import { ConfigService } from '../services/config.service';
import { DemiApiService } from '../services/demi-api.service';
import { OrgService } from '../services/org.service';
import { LoadingStateService } from '../services/loading-state.service';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { Constants } from '../shared/utils/constants';
import { withLoading } from '../shared/utils/rxjs-operators';
import { TableTemplateUtils, nativeSort, nextSortBy } from '../shared/utils/table-template-utils';
import { filterCompareWith } from '../shared/utils/utils';
import { SearchDocumentTableRowsComponent } from './search-document-table-rows/search-document-table-rows.component';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';
import { LoggingService } from '../services/logging.service';

type Dataset = 'Project' | 'Document';

/** DEMI list each tab reads, and its `sort` for a table `sortBy`; undefined keeps DEMI's default order. */
const KINDS: Record<Dataset, { kind: string; sort: (sortBy: string | null | undefined) => string | undefined }> = {
  Project: { kind: 'projects', sort: sortBy => nativeSort(sortBy, '', PROJECT_SORT_KEYS) || undefined },
  Document: { kind: 'documents', sort: nativeDocumentSort }
};

const PAGE_SIZE = 25;
/** DEMI refuses a signed-in read where page * pageSize goes past this. */
const MAX_PAGE_DEPTH = 20000;

const DATE_FILTERS: Record<Dataset, string[]> = {
  Project: ['decisionDateStart', 'decisionDateEnd'],
  Document: ['datePostedStart', 'datePostedEnd']
};

/** A multi-select: URL param `url` holds each picked item's `by`; DEMI filter `api` gets each item's `apiKey`. */
interface PickFilter {
  ui: string;
  url: string;
  items: any[];
  by: string;
  api: string;
  apiKey: string;
}

// TODO: Project and Document filters should be made into components
class SearchFilterObject {
  constructor(
    // Project
    public projectType: Array<any> = [],
    public eacDecision: Array<any> = [],
    public decisionDateStart: object = {},
    public decisionDateEnd: object = {},
    public proponent: Array<Proponent> = [],
    public region: Array<any> = [],
    public CEAAInvolvement: Array<any> = [],
    // Document
    public milestone: Array<any> = [],
    public datePostedStart: object = {},
    public datePostedEnd: object = {},
    public docType: Array<any> = [],
    public documentAuthorType: Array<any> = [],
    // both
    public projectPhase: Array<any> = []
  ) { }
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterModule,
    FormsModule,
    NgSelectModule,
    NgbDatepickerModule,
    TableTemplateComponent
  ]
})

export class SearchComponent implements OnInit {
  private toastService = inject(ToastService);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private orgService = inject(OrgService);
  private demiApi = inject(DemiApiService);
  public loadingState = inject(LoadingStateService);
  public loading = this.loadingState.getOperationState('search-results');
  private tableTemplateUtils = inject(TableTemplateUtils);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configService = inject(ConfigService);
  private logger = inject(LoggingService);

  public readonly constants = Constants;
  public results: Array<any> = [];
  public proponents: Array<Proponent> = [];
  public regions: Array<object> = [];
  public ceaaInvolvements: Array<object> = [];
  public eacDecisions: Array<object> = [];
  public projectTypes: Array<object> = [];

  public milestones: any[] = [];
  public authors: any[] = [];
  public docTypes: any[] = [];
  public projectPhases: any[] = [];

  public filterForURL: Record<string, string> = {};
  public filterForAPI: Record<string, string | string[]> = {};
  public filterForUI: SearchFilterObject = new SearchFilterObject();

  public showAdvancedSearch = true;

  public showFilters: Record<string, boolean> = {
    projectType: false,
    eacDecision: false,
    milestone: false,
    date: false,
    documentAuthorType: false,
    docType: false,
    projectPhase: false,
    more: false
  };

  public numFilters: Record<string, number> = {
    projectType: 0,
    eacDecision: 0,
    region: 0,
    CEAAInvolvement: 0,
    proponent: 0,
    milestone: 0,
    date: 0,
    documentAuthorType: 0,
    docType: 0,
    projectPhase: 0
  };

  // Project column values are DEMI sort keys, as on the project list.
  public projectTableData: TableObject;
  public projectTableColumns: TableColumn[] = [
    {
      name: 'Project Name',
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

  public documentTableData: TableObject;
  public documentTableColumns: TableColumn[] = [
    {
      name: 'Document Name',
      value: 'displayName',
      width: '37%'
    },
    {
      name: 'Status',
      value: 'status',
      width: '8%'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: '15%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '15%'
    },
    {
      name: 'Milestone',
      value: 'milestone',
      width: '15%'
    },
    {
      name: 'Legislation',
      value: 'legislation',
      width: '10%'
    }
  ];

  private destroyRef = inject(DestroyRef);

  public terms = new SearchTerms();
  public tableParams: TableParamsObject = new TableParamsObject();

  public searching = false;
  public ranSearch = false;
  public keywords: string;
  public hadFilter = false;

  public count: number = 0; // for template
  public currentPage = 1;
  public pageSize = PAGE_SIZE;
  // One stream for searches and page reads, so switchMap drops any read a later one replaced.
  private requests = new Subject<'search' | 'page' | 'none'>();
  private shown: { currentPage: number; sortBy: string | null } = { currentPage: 1, sortBy: null };

  private togglingOpen = signal('');

  constructor() {
    afterRenderEffect(() => {
      const id = this.togglingOpen();
      if (id) {
        const input = document.getElementById(id + '_input');
        if (input) {
          (input as HTMLElement).focus();
          this.togglingOpen.set('');
        }
      }
    });
  }

  ngOnInit() {
    // Fetch the Lists
    this.configService.lists.map(item => {
      switch (item.type) {
        case 'label':
          this.milestones.push({ ...item });
          break;
        case 'author':
          this.authors.push({ ...item });
          break;
        case 'doctype':
          this.docTypes.push({ ...item });
          break;
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

    this.docTypes = this.docTypes.sort((a, b) => {
      if (a.legislation !== b.legislation) {
        return (a.legislation || 0) - (b.legislation || 0);
      }
      return (a.listOrder || 0) - (b.listOrder || 0);
    });

    // Sort by legislation.
    this.milestones = this.milestones.sort((a, b) => (a.legislation || 0) - (b.legislation || 0));
    this.authors = this.authors.sort((a, b) => (a.legislation || 0) - (b.legislation || 0));
    this.projectPhases = this.projectPhases.sort((a, b) => (a.legislation || 0) - (b.legislation || 0));
    this.eacDecisions = this.eacDecisions.sort((a, b) => {
      if ((a["legislation"] || 0) !== (b["legislation"] || 0)) {
        return (a["legislation"] || 0) - (b["legislation"] || 0);
      }
      return (a["listOrder"] || 0) - (b["listOrder"] || 0);
    });
    this.ceaaInvolvements = this.ceaaInvolvements.sort((a, b) => {
      if ((a["legislation"] || 0) !== (b["legislation"] || 0)) {
        return (a["legislation"] || 0) - (b["legislation"] || 0);
      }
      return (a["listOrder"] || 0) - (b["listOrder"] || 0);
    });
    this.regions = this.regions.sort((a, b) => {
      if ((a["legislation"] || 0) !== (b["legislation"] || 0)) {
        return (a["legislation"] || 0) - (b["legislation"] || 0);
      }
      return (a["listOrder"] || 0) - (b["listOrder"] || 0);
    });
    this.projectTypes = Constants.PROJECT_TYPE_COLLECTION;

    this.requests
      .pipe(
        switchMap(kind => kind === 'none'
          ? of({ kind, page: null })
          : this.fetchPage().pipe(
            map(page => ({ kind, page })),
            finalize(() => {
              this.searching = false;
              this._changeDetectionRef.markForCheck();
            })
          )),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ kind, page }) => {
        if (kind === 'search' && page) {
          this.showPage(page);
          this.ranSearch = true;
        } else if (kind === 'page') {
          if (page) {
            this.showPagedResults(page);
          } else {
            this.restoreShownPage();
          }
        }
        this._changeDetectionRef.markForCheck();
      });

    this.orgService.listOrganizations({
      sort: 'name',
      pageSize: DEMI_MAX_PAGE_SIZE,
      count: true,
      filters: { companyType: 'Proponent/Certificate Holder' }
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(page => {
          this.proponents = page.rows;
          if ((page.total ?? 0) > page.rows.length) {
            this.logger.warn(`Proponent picker shows ${page.rows.length} of ${page.total}`, 'SearchComponent');
          }
          return this.route.params;
        })
      )
      .subscribe(params => this.searchFromParams(params));
  }

  private searchFromParams(params: any) {
    this.terms.keywords = params.keywords || null;
    this.terms.dataset = params.dataset === 'Project' ? 'Project' : 'Document';
    this.terms.sortBy = params.sortBy || null;

    this.setFiltersFromParams(params);
    this.updateCounts();

    this.keywords = this.terms.keywords;
    this.hadFilter = this.hasFilter();

    this.results = [];
    this.count = 0;
    this.ranSearch = false;

    // A sort alone is not a search; keep the landing view.
    if (!this.keywords && Object.keys(this.filterForAPI).length === 0) {
      this.requests.next('none');
      return;
    }

    this.searching = true;
    this.pageSize = Math.min(Math.max(1, parseInt(params.pageSize, 10) || PAGE_SIZE), DEMI_MAX_PAGE_SIZE);
    this.currentPage = Math.min(Math.max(1, parseInt(params.currentPage, 10) || 1), this.maxRows() / this.pageSize);
    this.requests.next('search');
  }

  /** Rows DEMI serves for the current page size: it refuses a read where page * pageSize passes MAX_PAGE_DEPTH. */
  private maxRows(): number {
    return Math.floor(MAX_PAGE_DEPTH / this.pageSize) * this.pageSize;
  }

  /** One page of the current tab's DEMI list, for the submitted keywords. A failed read shows an error and yields null. */
  private fetchPage(): Observable<DemiList<DemiProject | DemiDocument> | null> {
    const { kind, sort } = KINDS[this.terms.dataset];
    return this.demiApi.list<DemiProject | DemiDocument>(kind, {
      page: this.currentPage,
      pageSize: this.pageSize,
      count: true,
      sort: sort(this.terms.sortBy),
      q: this.keywords || undefined,
      filters: this.filterForAPI
    }).pipe(
      withLoading(this.loadingState, 'search-results'),
      timeout(45000),
      catchError(error => {
        this.logger.error('Search failed', 'SearchComponent', error);
        this.toastService.error('Search failed. Please try again.');
        return of(null);
      })
    );
  }

  private showPage(page: DemiList<DemiProject | DemiDocument>) {
    this.count = page.total ?? 0;
    this.results = page.rows;
    this.shown = { currentPage: this.currentPage, sortBy: this.terms.sortBy };
    this.setRowData();
  }

  /** After a failed page or sort read, puts the pager and sort arrow back on the rows still shown. */
  private restoreShownPage() {
    this.currentPage = this.shown.currentPage;
    this.terms.sortBy = this.shown.sortBy;
    this.setRowData();
  }

  setRowData() {
    this.tableParams.pageSize = this.pageSize;
    this.tableParams.currentPage = this.currentPage;
    // The pager stops where DEMI does.
    this.tableParams.totalListItems = Math.min(this.count, this.maxRows());
    this.tableParams.sortBy = this.terms.sortBy ? this.terms.sortBy : '';

    if (!this.results.length) {
      return;
    }
    if (this.terms.dataset === 'Document') {
      const rows = (this.results as DemiDocument[]).map(document => ({
        id: document.id,
        projectId: document.projectEagleId ?? document.projectId,
        displayName: document.displayName,
        datePosted: document.datePosted,
        status: document.isPublished ? 'Published' : 'Not Published',
        type: document.type,
        milestone: document.milestone,
        legislation: document.legislation
      }));
      this.documentTableData = new TableObject(SearchDocumentTableRowsComponent, rows, this.tableParams);
    } else {
      const rows = (this.results as DemiProject[]).map(toLegacyProject).map(project => ({
        // Track-only rows have no Eagle id; the project route also takes the DEMI id.
        _id: project._id ?? project.demiId,
        name: project.name,
        proponent: project.proponent,
        type: project.type,
        region: project.region,
        currentPhaseName: project.currentPhaseName,
        eacDecision: project.eacDecision
      }));
      this.projectTableData = new TableObject(ProjectListTableRowsComponent, rows, this.tableParams);
    }
  }

  setColumnSort(column) {
    this.terms.sortBy = this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.getPaginatedResults(1);
  }

  handleRadioChange(value: Dataset) {
    this.terms.dataset = value;
    // Sort keys differ between datasets.
    this.terms.sortBy = null;

    this.hideAllFilters();
    this.clearAllFilters();

    this.onSubmit();
  }

  /** The current tab's multi-select filters. */
  private pickFilters(): PickFilter[] {
    if (this.terms.dataset === 'Project') {
      const items: Record<keyof typeof PROJECT_FILTERS, any[]> = {
        region: this.regions,
        CEAAInvolvement: this.ceaaInvolvements,
        proponent: this.proponents,
        eacDecision: this.eacDecisions,
        type: this.projectTypes,
        projectPhase: this.projectPhases
      };
      // The type picker binds to filterForUI.projectType.
      return Object.entries(PROJECT_FILTERS)
        .map(([url, filter]) => ({ ...filter, url, ui: url === 'type' ? 'projectType' : url, items: items[url] }));
    }
    return [
      { ui: 'milestone', url: 'milestone', items: this.milestones, by: 'id', api: 'milestoneId', apiKey: 'id' },
      { ui: 'documentAuthorType', url: 'documentAuthorType', items: this.authors, by: 'id', api: 'documentAuthorTypeId', apiKey: 'id' },
      { ui: 'docType', url: 'type', items: this.docTypes, by: 'id', api: 'typeId', apiKey: 'id' },
      { ui: 'projectPhase', url: 'projectPhase', items: this.projectPhases, by: 'id', api: 'projectPhaseId', apiKey: 'id' }
    ];
  }

  setFiltersFromParams(params) {
    // Start clean: the other tab's picks must not count as filters here.
    this.filterForUI = new SearchFilterObject();
    this.filterForURL = {};
    this.filterForAPI = {};

    for (const f of this.pickFilters()) {
      const picked = (params[f.url] ? params[f.url].split(',') : [])
        .map(value => f.items.find(item => item[f.by] === value))
        .filter(Boolean);
      this.filterForUI[f.ui] = picked;
      if (picked.length) {
        this.filterForURL[f.url] = picked.map(item => item[f.by]).join(',');
        this.filterForAPI[f.api] = picked.map(item => item[f.apiKey]);
      }
    }

    for (const name of DATE_FILTERS[this.terms.dataset]) {
      this.filterForUI[name] = null;
      const date = params[name] ? DateTime.fromISO(params[name]) : null;
      if (date?.isValid) {
        this.filterForURL[name] = params[name];
        this.filterForAPI[name] = params[name];
        this.filterForUI[name] = { year: date.year, month: date.month, day: date.day };
      }
    }
  }

  isNGBDate(date) {
    return date && date.year && date.month && date.day;
  }

  setParamsFromFilters(params) {
    for (const f of this.pickFilters()) {
      if (this.filterForUI[f.ui]?.length) {
        params[f.url] = this.filterForUI[f.ui].map(item => item[f.by]).join(',');
      }
    }
    for (const name of DATE_FILTERS[this.terms.dataset]) {
      const ui = this.filterForUI[name];
      if (this.isNGBDate(ui)) {
        params[name] = DateTime.fromObject({ year: ui.year, month: ui.month, day: ui.day }).toISODate();
      }
    }
  }

  toggleFilter(name) {
    if (this.showFilters[name]) {
      this.togglingOpen.set('');
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
      this.togglingOpen.set(name);
    }
  }

  isShowingFilter() {
    return Object.keys(this.showFilters).some(key => { return this.showFilters[key]; });
  }

  hideAllFilters() {
    Object.keys(this.showFilters).forEach(key => {
      this.showFilters[key] = false;
    });
  }

  hasFilter() {
    this.updateCounts();
    return Object.keys(this.numFilters).some(key => { return this.numFilters[key]; });
  }

  clearAllFilters() {
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
    this.updateCounts();
  }

  updateCount(name) {
    const getCount = (n) => { return Object.keys(this.filterForUI[n] ?? {}).filter(k => this.filterForUI[n][k]).length; };

    let num = 0;
    if (name === 'date') {
      num += this.isNGBDate(this.filterForUI.datePostedStart) ? 1 : 0;
      num += this.isNGBDate(this.filterForUI.datePostedEnd) ? 1 : 0;
    } else {
      num = getCount(name);
      if (name === 'eacDecision') {
        num += this.isNGBDate(this.filterForUI.decisionDateStart) ? 1 : 0;
        num += this.isNGBDate(this.filterForUI.decisionDateEnd) ? 1 : 0;
      }
    }
    this.numFilters[name] = num;
  }

  updateCounts() {
    // Projects
    this.updateCount('projectType');
    this.updateCount('eacDecision');
    this.updateCount('region');
    this.updateCount('CEAAInvolvement');
    this.updateCount('proponent');

    // Documents
    this.updateCount('milestone');
    this.updateCount('date');
    this.updateCount('documentAuthorType');
    this.updateCount('docType');
    this.updateCount('projectPhase');
  }

  getPaginatedResults(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.tableParams = this.tableTemplateUtils.updateTableParams(
      this.tableParams,
      pageNumber,
      this.terms.sortBy
    );
    this.pageSize = this.tableParams.pageSize;
    this.currentPage = this.tableParams.currentPage;
    this.requests.next('page');
  }

  private showPagedResults(page: DemiList<DemiProject | DemiDocument>) {
    this.tableTemplateUtils.updateUrl(
      this.tableParams.sortBy,
      this.tableParams.currentPage,
      this.tableParams.pageSize,
      { dataset: this.terms.dataset, ...this.filterForURL },
      this.keywords ?? ''
    );
    this.showPage(page);
    this._changeDetectionRef.markForCheck();
  }

  // Starts a new search from the form or the tab buttons.
  public onSubmit() {
    // Angular Router ignores navigation to the current URL;
    // the `ms` param changes the URL so the list reloads.
    this.currentPage = 1;
    const params = this.terms.getParams();
    params['ms'] = Date.now();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.currentPage;
    params['pageSize'] = this.pageSize;

    this.setParamsFromFilters(params);

    this.router.navigate(['search', params]);
  }

  clearSelectedItem(filter: string, item: any) {
    this.filterForUI[filter] = this.filterForUI[filter].filter(option => option.id !== item.id);
  }

  public readonly filterCompareWith = filterCompareWith;
}
