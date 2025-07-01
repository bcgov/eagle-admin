import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import moment from 'moment';
import { Org } from 'src/app/models/org';
import { Project } from 'src/app/models/project';
import { SearchTerms } from 'src/app/models/search';
import { ConfigService } from 'src/app/services/config.service';
import { OrgService } from 'src/app/services/org.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { Constants } from 'src/app/shared/utils/constants';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { ProjectListTableRowsComponent } from './project-list-table-rows/project-list-table-rows.component';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';

class ProjectFilterObject {
  constructor(
    public type: Array<object> = [],
    public eacDecision: Array<object> = [],
    public decisionDateStart: object = {},
    public decisionDateEnd: object = {},
    public pcp: Array<object> = [],
    public proponent: Array<Org> = [],
    public region: Array<object> = [],
    public CEAAInvolvement: Array<any> = [],
    public vc: Array<object> = [],
    public projectPhase: Array<object> = [],
  ) { }
}

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, NgSelectModule, TableTemplateComponent, NgbDatepickerModule],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  public readonly constants = Constants;
  public projects: Array<Project> = [];
  public proponents: Array<Org> = [];
  public regions: Array<any> = [];
  public ceaaInvolvements: Array<object> = [];
  public eacDecisions: Array<object> = [];
  public commentPeriods: Array<object> = [];
  public projectTypes: Array<object> = [];
  public projectPhases: Array<object> = [];
  public placeholderDateRangeModel: Array<object>;
  public dateRangeItems: Array<object> = [{}];

  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();
  public terms = new SearchTerms();

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public filterForUI: ProjectFilterObject = new ProjectFilterObject();

  public showAdvancedSearch = true;

  public showFilters: object = {
    type: false,
    eacDecision: false,
    pcp: false,
    more: false
  };

  public numFilters: object = {
    type: 0,
    eacDecision: 0,
    pcp: 0,
    more: 0
  };

  public projectTableData: TableObject;
  public projectTableColumns: any[] = [
    {
      name: 'Name',
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

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private navigationStackUtils: NavigationStackUtils,
    private orgService: OrgService,
    private searchService: SearchService,
    private storageService: StorageService,
    private configService: ConfigService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.orgService.getByCompanyType('Proponent/Certificate Holder')
        .pipe(
          switchMap((res: any) => {
            this.proponents = res || [];
            this.commentPeriods = Constants.PCP_COLLECTION;
            this.projectTypes = Constants.PROJECT_TYPE_COLLECTION;
            this.getLists();
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
            return this.route.data;
          }),
        )
        .subscribe((res: any) => {
          if (res.projects[0].data) {
            if (res.projects[0].data.searchResults.length > 0) {
              this.tableParams.totalListItems =
                res.projects[0].data.meta[0].searchResultsTotal;
              this.projects = res.projects[0].data.searchResults;
            } else {
              this.tableParams.totalListItems = 0;
              this.projects = [];
            }
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load topics');
            this.router.navigate(['/']);
          }
        }));
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

  paramsToCheckboxFilters(params, name, map) {
    this.filterForUI[name] = {};
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];

      const values = params[name].split(',');
      const apiValues = [];
      values.forEach(value => {
        this.filterForUI[name][value] = true;
        apiValues.push(map && map[value] ? map[value] : value);
      });
      if (apiValues.length) {
        this.filterForAPI[name] = apiValues.join(',');
      }
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

  setFiltersFromParams(params) {
    this.paramsToCollectionFilters(params, 'region', this.regions, 'code');
    this.paramsToCollectionFilters(params, 'CEAAInvolvement', this.ceaaInvolvements, '_id');
    this.paramsToCollectionFilters(params, 'proponent', this.proponents, '_id');
    this.paramsToCollectionFilters(params, 'vc', null, '_id');
    this.paramsToCollectionFilters(params, 'eacDecision', this.eacDecisions, '_id');
    this.paramsToCollectionFilters(params, 'pcp', this.commentPeriods, 'code');
    this.paramsToCollectionFilters(params, 'type', this.projectTypes, 'name');
    this.paramsToCollectionFilters(params, 'projectPhase', this.projectPhases, '_id');

    this.paramsToDateFilters(params, 'decisionDateStart');
    this.paramsToDateFilters(params, 'decisionDateEnd');
  }

  checkboxFilterToParams(params, name) {
    const keys = [];
    Object.keys(this.filterForUI[name]).forEach(key => {
      if (this.filterForUI[name][key]) {
        keys.push(key);
      }
    });
    if (keys.length) {
      params[name] = keys.join(',');
    }
  }

  collectionFilterToParams(params, name, identifyBy) {
    if (this.filterForUI[name].length) {
      const values = this.filterForUI[name].map(record => {
        return record[identifyBy];
      });
      params[name] = values.join(',');
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

  setParamsFromFilters(params) {
    this.checkboxFilterToParams(params, 'pcp');

    this.collectionFilterToParams(params, 'region', 'code');
    this.collectionFilterToParams(params, 'CEAAInvolvement', '_id');
    this.collectionFilterToParams(params, 'proponent', '_id');
    this.collectionFilterToParams(params, 'vc', '_id');
    this.collectionFilterToParams(params, 'eacDecision', '_id');
    this.collectionFilterToParams(params, 'pcp', 'code');
    this.collectionFilterToParams(params, 'type', 'name');
    this.collectionFilterToParams(params, 'projectPhase', '_id');

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
    if (name === 'more') {
      num =
        getCount('region') +
        this.filterForUI.proponent.length +
        getCount('CEAAInvolvement') +
        this.filterForUI.vc.length;
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
    this.updateCount('type');
    this.updateCount('eacDecision');
    this.updateCount('pcp');
    this.updateCount('more');
    this.updateCount('projectPhase');
  }

  setRowData() {
    const projectList = [];
    if (this.projects && this.projects.length > 0) {
      this.projects.forEach(project => {
        projectList.push({
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
        projectList,
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
    this.getPaginatedProjects(this.tableParams.currentPage);
  }

  getPaginatedProjects(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(
      this.tableParams,
      pageNumber,
      this.tableParams.sortBy
    );

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
          this.tableParams.keywords || '',
          'Project',
          null,
          pageNumber,
          this.tableParams.pageSize,
          this.tableParams.sortBy,
          {},
          true,
          this.filterForAPI,
          ''
        )
        .subscribe((res: any) => {
          if (this.filterForAPI.hasOwnProperty('currentPhaseName')) {
            this.filterForAPI['projectPhase'] = this.filterForAPI['currentPhaseName'];
            delete this.filterForAPI['currentPhaseName'];
          }
          if (res[0].data) {
            this.tableParams.totalListItems =
              res[0].data.meta[0].searchResultsTotal;
            this.projects = res[0].data.searchResults;
            this.tableTemplateUtils.updateUrl(
              this.tableParams.sortBy,
              this.tableParams.currentPage,
              this.tableParams.pageSize,
              this.filterForURL,
              this.tableParams.keywords
            );
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load topics');
            this.router.navigate(['/']);
          }
        }));
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = currentPage;
    params['sortBy'] = this.tableParams.sortBy = '';
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
    const startSet = (this.filterForUI.decisionDateStart != null && this.isNGBDate(this.filterForUI.decisionDateStart));
    const endSet = (this.filterForUI.decisionDateEnd != null && this.isNGBDate(this.filterForUI.decisionDateEnd));
    return (startSet || endSet);
  }

  clearSelectedItem(filterType: string, item: any) {
    console.log('clear selected items: ', filterType, ' item: ', item);
    if (filterType === 'eacDecision' || filterType === 'projectPhase' || filterType === 'CEAAInvolvement') {
      this.filterForUI[filterType] = this.filterForUI[filterType].filter(option => option._id !== item._id);
    } else {
      this.filterForUI[filterType] = this.filterForUI[filterType].filter(option => option.name !== item.name);
    }
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
