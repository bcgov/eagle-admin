import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, DoCheck, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { of, Subscription } from 'rxjs';

import { switchMap } from 'rxjs/operators';

import moment from 'moment';
import { Org } from '../models/org';
import { SearchTerms } from '../models/search';
import { ProjectListTableRowsComponent } from '../projects/project-list/project-list-table-rows/project-list-table-rows.component';
import { ApiService } from '../services/api';
import { ConfigService } from '../services/config.service';
import { OrgService } from '../services/org.service';
import { SearchService } from '../services/search.service';
import { TableObject } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { Constants } from '../shared/utils/constants';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';
import { SearchDocumentTableRowsComponent } from './search-document-table-rows/search-document-table-rows.component';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';

// TODO: Project and Document filters should be made into components
class SearchFilterObject {
  constructor(
    // Project
    public projectType: object = {},
    public eacDecision: object = {},
    public decisionDateStart: object = {},
    public decisionDateEnd: object = {},
    public pcp: object = {},
    public proponent: Array<Org> = [],
    public region: Array<string> = [],
    public CEAAInvolvement: Array<string> = [],
    public vc: Array<object> = [],
    // Document
    public milestone: Array<string> = [],
    public datePostedStart: object = {},
    public datePostedEnd: object = {},
    public docType: Array<string> = [],
    public documentAuthorType: Array<string> = [],
    // both
    public projectPhase: Array<string> = []
  ) { }
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    NgSelectModule,
    NgbDatepickerModule,
    TableTemplateComponent
  ]
})

export class SearchComponent implements OnInit, OnDestroy, DoCheck {
  public readonly constants = Constants;
  public results: Array<any> = [];
  public proponents: Array<Org> = [];
  public regions: Array<object> = [];
  public ceaaInvolvements: Array<object> = [];
  public eacDecisions: Array<object> = [];
  public commentPeriods: Array<object> = [];
  public projectTypes: Array<object> = [];

  public milestones: any[] = [];
  public authors: any[] = [];
  public docTypes: any[] = [];
  public projectPhases: any[] = [];
  public loading = true;

  public filterForURL: object = {}; // Not used on this page yet
  public filterForAPI: object = {};
  public filterForUI: SearchFilterObject = new SearchFilterObject();

  public showAdvancedSearch = true;

  public showFilters: object = {
    projectType: false,
    eacDecision: false,
    pcp: false,
    more: false,
    milestone: false,
    date: false,
    documentAuthorType: false,
    docType: false,
    projectPhase: false
  };

  public numFilters: object = {
    projectType: 0,
    eacDecision: 0,
    pcp: 0,
    more: 0,
    milestone: 0,
    date: 0,
    documentAuthorType: 0,
    docType: 0,
    projectPhase: 0
  };

  public projectTableData: TableObject;
  public projectTableColumns: any[] = [
    {
      name: 'Project Name',
      value: 'name',
      width: '20%'
    },
    {
      name: 'Proponent',
      value: 'proponent.name',
      width: '20%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '15%'
    },
    {
      name: 'Region',
      value: 'region',
      width: '15%'
    },
    {
      name: 'Phase',
      value: 'currentPhaseName',
      width: '15%'
    },
    {
      name: 'Decision',
      value: 'eacDecision',
      width: '15%'
    }
  ];

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
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

  public terms = new SearchTerms();
  public tableParams: TableParamsObject = new TableParamsObject();

  private subscriptions = new Subscription();
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;

  public searching = false;
  public ranSearch = false;
  public keywords: string;
  public hadFilter = false;

  public count = 0; // for template
  public currentPage = 1;
  public pageSize = 10;

  private togglingOpen = '';

  public pageSizeArray: number[];

  constructor(
    public snackBar: MatSnackBar,
    private _changeDetectionRef: ChangeDetectorRef,
    public api: ApiService,
    private orgService: OrgService,
    public searchService: SearchService, // also used in template
    private tableTemplateUtils: TableTemplateUtils,
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) { }

  // TODO: when clicking on radio buttons, url must change to reflect dataset.

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

    // This code reorders the document type list defined by EAO (See Jira Ticket EAGLE-88)
    // todo how are we handling these lists with legislation year in advanced search? EE-406
    // this.docTypes = this.docTypes.filter(item => item.legislation === 2002);
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

    // Fetch proponents and other collections
    // TODO: Put all of these into Lists
    this.subscriptions.add(
      this.orgService.getByCompanyType('Proponent/Certificate Holder')
        .pipe(
          switchMap((res: any) => {
            this.proponents = res || [];

            this.commentPeriods = Constants.PCP_COLLECTION;
            this.projectTypes = Constants.PROJECT_TYPE_COLLECTION;

            return this.route.params;
          }),
          switchMap((res: any) => {
            const params = { ...res };

            this.terms.keywords = params.keywords || null;
            this.terms.dataset = params.dataset || 'Document';

            this.setFiltersFromParams(params);

            this.updateCounts();

            this.keywords = this.terms.keywords;
            this.hadFilter = this.hasFilter();

            // additional check to see if we have any filter elements applied to the
            // query string. Previously these were ignored on a refresh
            const filterKeys = Object.keys(this.filterForAPI);
            const hasFilterFromQueryString = (filterKeys && filterKeys.length > 0);
            if (Object.keys(this.terms.getParams()).length === 0
              && !this.hasFilter()
              && !hasFilterFromQueryString) {
              return of(null);
            }

            this.results = [];

            this.searching = true;
            this.count = 0;
            this.currentPage = params.currentPage ? params.currentPage : 1;
            this.pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 25;
            this.tableParams.currentPage = this.currentPage;
            this.tableParams.pageSize = this.pageSize;

            // remove doc and project types
            // The UI filters are remapping document and project type to the single 'Type' value
            // this means that whenever we map back to the filters, we need to revert them
            // from 'type', to the appropriate type. Additionally, the API will fail if we
            // send "docType" ir "projectType" as a filter, so we need to ensure these are
            // stripped from the filterForAPI
            delete this.filterForAPI['docType'];
            delete this.filterForAPI['projectType'];

            // if we're searching for projects, replace projectPhase with currentPhaseName
            // The code is called projectPhase, but the db column on projects is currentPhaseName
            // so the rename is required to pass in the correct query
            if (this.filterForAPI.hasOwnProperty('projectPhase') && this.terms.dataset === 'Project') {
              this.filterForAPI['currentPhaseName'] = this.filterForAPI['projectPhase'];
              delete this.filterForAPI['projectPhase'];
            }

            return this.searchService.getSearchResults(
              this.terms.keywords,
              this.terms.dataset,
              null,
              this.currentPage,
              this.pageSize,
              null,
              {},
              true,
              this.filterForAPI,
              ''
            );
          })
        )
        .subscribe({
          next: (res: any) => {
            // if we renamed the projectPhase to currentPhaseName when querying for projects, revert
            // the change so the UI can function as normal
            if (this.filterForAPI.hasOwnProperty('currentPhaseName') && this.terms.dataset === 'Project') {
              this.filterForAPI['projectPhase'] = this.filterForAPI['currentPhaseName'];
              delete this.filterForAPI['currentPhaseName'];
            }

            if (res && res[0].data.meta.length > 0) {
              this.count = res[0].data.meta[0].searchResultsTotal;
              this.results = res[0].data.searchResults;
            } else {
              this.count = 0;
              this.results = [];
            }
            this.setRowData();
            this.loading = false;
            this.searching = false;
            this.ranSearch = true;
            this._changeDetectionRef.detectChanges();
            const pageSizeTemp = [10, 25, 50, 100, this.count];
            this.pageSizeArray = pageSizeTemp.filter(function (el: number) { return el >= 10; });
            this.pageSizeArray.sort(function (a: number, b: number) { return a - b; });
          },
          error: (error) => {
            console.log('error =', error);

            // update variables on error
            this.loading = false;
            this.searching = false;
            this.ranSearch = true;

            this.snackBarRef = this.snackBar.open('Error searching projects ...', 'RETRY');
            this.subscriptions.add(
              this.snackBarRef.onAction().subscribe(() => this.onSubmit())
            );
          }
          // No need for complete handler
        })
    );
  }

  ngDoCheck() {
    if (this.togglingOpen) {
      // Focus on designated input when pane is opened
      const input = document.getElementById(this.togglingOpen + '_input');
      if (input) {
        input.focus();
        this.togglingOpen = '';
      }
    }
  }

  setRowData() {
    const itemList = [];
    this.tableParams.pageSize = this.pageSize;
    this.tableParams.currentPage = this.currentPage;
    this.tableParams.totalListItems = this.count;
    this.tableParams.sortBy = this.terms.sortBy ? this.terms.sortBy : '';

    if (this.results && this.results.length > 0) {
      if (this.terms.dataset === 'Document') {
        this.results.forEach(document => {
          itemList.push({
            displayName: document.displayName,
            documentFileName: document.documentFileName,
            datePosted: document.datePosted,
            status: document.read.includes('public')
              ? 'Published'
              : 'Not Published',
            type: document.type,
            milestone: document.milestone,
            legislation: document.legislation,
            _id: document._id,
            project: document.project,
            sortOrder: document.sortOrder,
          });
        });

        this.documentTableData = new TableObject(
          SearchDocumentTableRowsComponent,
          itemList,
          this.tableParams
        );
      } else {
        this.results.forEach(project => {
          itemList.push({
            _id: project._id,
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
          itemList,
          this.tableParams
        );
      }
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.startsWith('+')) {
      this.terms.sortBy = '-' + column;
      this.tableParams.sortBy = '-' + column;
    } else {
      this.terms.sortBy = '+' + column;
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedResults(this.tableParams.currentPage);
  }

  handleRadioChange(value) {
    this.terms.dataset = value;

    this.hideAllFilters();
    this.clearAllFilters();

    this.onSubmit();
  }

  updatePageNumber(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.currentPage = pageNumber;
    this.onSubmit();
  }

  updatePageSize(pageSize) {
    window.scrollTo(0, 0);
    this.currentPage = 1;
    this.pageSize = parseInt(pageSize, 10);
    this.onSubmit();
  }

  paramsToCheckboxFilters(params, name, map) {
    const paramname = name === 'projectType' ? 'type' : name;

    this.filterForUI[name] = {};
    delete this.filterForURL[paramname];
    delete this.filterForAPI[paramname];

    if (params[paramname]) {
      this.filterForURL[paramname] = params[paramname];

      const values = params[paramname].split(',');
      const apiValues = [];
      values.forEach(value => {
        this.filterForUI[name][value] = true;
        apiValues.push(map && map[value] ? map[value] : value);
      });
      if (apiValues.length) {
        this.filterForAPI[paramname] = apiValues.join(',');
      }
    }
  }

  paramsToCollectionFilters(params, name, collection, identifyBy) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    // The UI filters are remapping document and project type to the single 'Type' value
    // this means that whenever we map back to the filters, we need to revert them
    // from 'type', to the appropriate type.
    const optionName = this.terms.dataset === 'Document' && name === 'type' ? 'docType' :
      this.terms.dataset === 'Project' && name === 'type' ? 'projectType' : name;

    if (optionName !== name) {
      delete this.filterForURL[optionName];
      delete this.filterForAPI[optionName];
    }

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
        if (optionName !== name) {
          this.filterForURL[optionName] = encodeURI(confirmedValues.join(','));
          this.filterForAPI[optionName] = confirmedValues.join(',');
        }

        this.filterForURL[name] = encodeURI(confirmedValues.join(','));
        this.filterForAPI[name] = confirmedValues.join(',');
      }
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
      this.filterForUI[name] = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    }
  }

  setFiltersFromParams(params) {
    if (this.terms.dataset === 'Project') {
      this.paramsToCollectionFilters(params, 'region', this.regions, 'code');
      this.paramsToCollectionFilters(params, 'CEAAInvolvement', this.ceaaInvolvements, '_id');
      this.paramsToCollectionFilters(params, 'proponent', this.proponents, '_id');
      this.paramsToCollectionFilters(params, 'vc', null, '_id');
      this.paramsToCollectionFilters(params, 'eacDecision', this.eacDecisions, '_id');
      this.paramsToCollectionFilters(params, 'pcp', this.commentPeriods, 'code');
      this.paramsToCollectionFilters(params, 'projectType', this.projectTypes, 'name');
      this.paramsToCollectionFilters(params, 'type', this.projectTypes, 'name');
      this.paramsToCollectionFilters(params, 'projectPhase', this.projectPhases, '_id');

      this.paramsToDateFilters(params, 'decisionDateStart');
      this.paramsToDateFilters(params, 'decisionDateEnd');
    } else if (this.terms.dataset === 'Document') {
      this.paramsToCollectionFilters(params, 'milestone', this.milestones, '_id');
      this.paramsToCollectionFilters(params, 'documentAuthorType', this.authors, '_id');
      this.paramsToCollectionFilters(params, 'docType', this.docTypes, '_id');
      this.paramsToCollectionFilters(params, 'type', this.docTypes, '_id');
      this.paramsToCollectionFilters(params, 'projectPhase', this.projectPhases, '_id');

      this.paramsToDateFilters(params, 'datePostedStart');
      this.paramsToDateFilters(params, 'datePostedEnd');
    }
  }

  checkboxFilterToParams(params, name) {
    const keys = [];
    Object.keys(this.filterForUI[name]).forEach(key => {
      if (this.filterForUI[name][key]) {
        keys.push(key);
      }
    });
    if (keys.length) {
      params[name === 'projectType' ? 'type' : name] = keys.join(',');
    }
  }

  collectionFilterToParams(params, name, identifyBy) {
    if (this.filterForUI[name].length) {
      const values = this.filterForUI[name].map(record => { return record[identifyBy]; });
      params[(name === 'docType' || name === 'projectType') ? 'type' : name] = values.join(',');
    }
  }

  isNGBDate(date) {
    return date && date.year && date.month && date.day;
  }

  dateFilterToParams(params, name) {
    if (this.isNGBDate(this.filterForUI[name])) {
      const date = new Date(this.filterForUI[name].year, this.filterForUI[name].month - 1, this.filterForUI[name].day);
      params[name] = moment(date).format('YYYY-MM-DD');
    }
  }

  setParamsFromFilters(params) {
    if (this.terms.dataset === 'Project') {
      this.collectionFilterToParams(params, 'region', 'code');
      this.collectionFilterToParams(params, 'CEAAInvolvement', '_id');
      this.collectionFilterToParams(params, 'eacDecision', '_id');
      this.collectionFilterToParams(params, 'pcp', 'code');
      this.collectionFilterToParams(params, 'proponent', '_id');
      this.collectionFilterToParams(params, 'vc', '_id');
      this.collectionFilterToParams(params, 'projectType', 'name');
      this.collectionFilterToParams(params, 'projectPhase', '_id');

      this.dateFilterToParams(params, 'decisionDateStart');
      this.dateFilterToParams(params, 'decisionDateEnd');
    } else if (this.terms.dataset === 'Document') {
      this.collectionFilterToParams(params, 'milestone', '_id');
      this.collectionFilterToParams(params, 'documentAuthorType', '_id');
      this.collectionFilterToParams(params, 'docType', '_id');
      this.collectionFilterToParams(params, 'projectPhase', '_id');

      this.dateFilterToParams(params, 'datePostedStart');
      this.dateFilterToParams(params, 'datePostedEnd');
    }
  }

  toggleFilter(name) {
    if (this.showFilters[name]) {
      this.togglingOpen = '';
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
      this.togglingOpen = name;
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
    const getCount = (n) => { return Object.keys(this.filterForUI[n]).filter(k => this.filterForUI[n][k]).length; };

    let num = 0;
    if (name === 'date') {
      num += this.isNGBDate(this.filterForUI.datePostedStart) ? 1 : 0;
      num += this.isNGBDate(this.filterForUI.datePostedEnd) ? 1 : 0;
    } else if (name === 'more') {
      num = getCount('region') + this.filterForUI.proponent.length + getCount('CEAAInvolvement') + this.filterForUI.vc.length;
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
    this.updateCount('pcp');
    this.updateCount('more');

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
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(
      this.tableParams,
      pageNumber,
      this.terms.sortBy
    );
    this.pageSize = this.tableParams.pageSize;
    this.currentPage = this.tableParams.currentPage;

    // if we're searching for projects, replace projectPhase with currentPhaseName
    // The code is called projectPhase, but the db column on projects is currentPhaseName
    // so the rename is required to pass in the correct query
    if (this.filterForAPI.hasOwnProperty('projectPhase')) {
      this.filterForAPI['currentPhaseName'] = this.filterForAPI['projectPhase'];
      delete this.filterForAPI['projectPhase'];
    }

    this.subscriptions.add(
      this.searchService
        .getSearchResults(
          this.terms.keywords,
          this.terms.dataset,
          null,
          pageNumber,
          this.tableParams.pageSize,
          this.tableParams.sortBy,
          {},
          true,
          this.filterForAPI,
          ''
        )
        .subscribe({
          next: (res: any) => {
            // if we renamed the projectPhase to currentPhaseName when querying for projects, revert
            // the change so the UI can function as normal
            if (this.filterForAPI.hasOwnProperty('currentPhaseName')) {
              this.filterForAPI['projectPhase'] = this.filterForAPI['currentPhaseName'];
              delete this.filterForAPI['currentPhaseName'];
            }

            if (res[0].data) {
              this.count = res[0].data.meta[0].searchResultsTotal;
              this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
              this.results = res[0].data.searchResults;
              this.tableTemplateUtils.updateUrl(
                this.tableParams.sortBy,
                this.tableParams.currentPage,
                this.tableParams.pageSize,
                this.filterForURL,
                this.terms.keywords
              );
              this.setRowData();
              this.loading = false;
              this._changeDetectionRef.detectChanges();
            } else {
              alert('Uh-oh, couldn\'t load topics');
              // project not found --> navigate back to search
              this.router.navigate(['/']);
            }
          }
          // No need for error or complete handler here
        })
    );
  }

  // reload page with current search terms
  public onSubmit() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.currentPage ? this.currentPage : 1;
    params['pageSize'] = this.pageSize ? this.pageSize : 10;

    this.setParamsFromFilters(params);

    this.router.navigate(['search', params]);
  }

  // Compares selected options when a dropdown is grouped by legislation.
  compareDropdownOptions(optionA: any, optionB: any) {
    if ((optionA.name === optionB.name) && (optionA.legislation === optionB.legislation)) {
      return true;
    }

    return false;
  }

  clearSelectedItem(filter: string, item: any) {
    this.filterForUI[filter] = this.filterForUI[filter].filter(option => option._id !== item._id);
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
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }
    this.subscriptions.unsubscribe();
  }
}
