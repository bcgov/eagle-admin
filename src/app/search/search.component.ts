import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, DoCheck } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';

import * as _ from 'lodash';
import * as moment from 'moment';

import { Document } from 'app/models/document';
import { Org } from 'app/models/org';
import { SearchTerms } from 'app/models/search';

import { ApiService } from 'app/services/api';
import { OrgService } from 'app/services/org.service';
import { SearchService } from 'app/services/search.service';

import { Constants } from 'app/shared/utils/constants';

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
    public documentAuthorType: Array<string> = []
  ) { }
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchComponent implements OnInit, OnDestroy, DoCheck {
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
    docType: false
  };

  public numFilters: object = {
    projectType: 0,
    eacDecision: 0,
    pcp: 0,
    more: 0,
    milestone: 0,
    date: 0,
    documentAuthorType: 0,
    docType: 0
  };

  public terms = new SearchTerms();
  private ngUnsubscribe = new Subject<boolean>();

  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;

  public searching = false;
  public ranSearch = false;
  public keywords: string;
  public hadFilter = false;

  public count = 0; // for template
  public currentPage: 1;
  public pageSize: 10;

  private togglingOpen = '';

  // These values should be moved into Lists instead of being hard-coded all over the place

  private REGIONS_COLLECTION: Array<object> = [
    { code: 'Cariboo', name: 'Cariboo' },
    { code: 'Kootenay', name: 'Kootenay' },
    { code: 'Lower Mainland', name: 'Lower Mainland' },
    { code: 'Okanagan', name: 'Okanagan' },
    { code: 'Omineca', name: 'Omineca' },
    { code: 'Peace', name: 'Peace' },
    { code: 'Skeena', name: 'Skeena' },
    { code: 'Thompson-Nicola', name: 'Thompson-Nicola' },
    { code: 'Vancouver Island', name: 'Vancouver Island' }
  ];

  constructor(
    public snackBar: MatSnackBar,
    private _changeDetectionRef: ChangeDetectorRef,
    public api: ApiService,
    private orgService: OrgService,
    public searchService: SearchService, // also used in template
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // TODO: when clicking on radio buttons, url must change to reflect dataset.

  ngOnInit() {
    // Fetch the Lists
    this.searchService.getFullList('List')
      .switchMap((res: any) => {
        if (res.length > 0) {
          res[0].searchResults.map(item => {
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
              default:
                break;
            }
          });
        }

        // This code reorders the document type list defined by EAO (See Jira Ticket EAGLE-88)
        // todo how are we handling these lists with legislation year in advanced search? EE-406
        // this.docTypes = this.docTypes.filter(item => item.legislation === 2002);
        this.docTypes = _.sortBy(this.docTypes, ['legislation', 'listOrder']);

        // Sort by legislation.
        this.milestones = _.sortBy(this.milestones, ['legislation']);
        this.authors = _.sortBy(this.authors, ['legislation']);
        this.eacDecisions = _.sortBy(this.eacDecisions, ['legislation', 'listOrder']);
        this.ceaaInvolvements = _.sortBy(this.ceaaInvolvements, ['legislation', 'listOrder']);

        // Fetch proponents and other collections
        // TODO: Put all of these into Lists
        return this.orgService.getByCompanyType('Proponent/Certificate Holder');
      })
      .switchMap((res: any) => {
        this.proponents = res || [];

        this.regions = this.REGIONS_COLLECTION;
        this.commentPeriods = Constants.PCP_COLLECTION;
        this.projectTypes = Constants.PROJECT_TYPE_COLLECTION;

        return this.route.params;
      })
      .switchMap((res: any) => {
        let params = { ...res };

        this.terms.keywords = params.keywords || null;
        this.terms.dataset = params.dataset || 'Document';

        this.setFiltersFromParams(params);

        this.updateCounts();

        this.keywords = this.terms.keywords;
        this.hadFilter = this.hasFilter();

        if (_.isEmpty(this.terms.getParams()) && !this.hasFilter()) {
          return Observable.of(null);
        }

        this.results = [];

        this.searching = true;
        this.count = 0;
        this.currentPage = params.currentPage ? params.currentPage : 1;
        this.pageSize = params.pageSize ? params.pageSize : 25;

        // remove doc and project types
        // The UI filters are remapping document and project type to the single 'Type' value
        // this means that whenever we map back to the filters, we need to revert them
        // from 'type', to the appropriate type. Additionally, the API will fail if we
        // send "docType" ir "projectType" as a filter, so we need to ensure these are
        // stripped from the filterForAPI
        delete this.filterForAPI['docType'];
        delete this.filterForAPI['projectType'];

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
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res && res[0].data.meta.length > 0) {
          this.count = res[0].data.meta[0].searchResultsTotal;
          let items = res[0].data.searchResults;
          items.map(item => {
            if (this.terms.dataset === 'Document') {
              this.results.push(new Document(item));
            } else {
              this.results.push(item);
            }
          });
        } else {
          this.count = 0;
          this.results = [];
        }
        this.loading = false;
        this.searching = false;
        this.ranSearch = true;
        this._changeDetectionRef.detectChanges();
      }, error => {
        console.log('error =', error);

        // update variables on error
        this.loading = false;
        this.searching = false;
        this.ranSearch = true;

        this.snackBarRef = this.snackBar.open('Error searching projects ...', 'RETRY');
        this.snackBarRef.onAction().subscribe(() => this.onSubmit());
      }, () => { // onCompleted
        // update variables on completion
      });
  }

  ngDoCheck() {
    if (this.togglingOpen) {
      // Focus on designated input when pane is opened
      let input = document.getElementById(this.togglingOpen + '_input');
      if (input) {
        input.focus();
        this.togglingOpen = '';
      }
    }
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

  paramsToCheckboxFilters(params, name, map) {
    const paramname = name === 'projectType' ? 'type' : name;

    this.filterForUI[name] = {};
    delete this.filterForURL[paramname];
    delete this.filterForAPI[paramname];

    if (params[paramname]) {
      this.filterForURL[paramname] = params[paramname];

      const values = params[paramname].split(',');
      let apiValues = [];
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
    let optionName = this.terms.dataset === 'Document' && name === 'type' ? 'docType' :
           this.terms.dataset === 'Project' && name === 'type' ? 'projectType' : name;

    if (optionName !== name) {
      delete this.filterForURL[optionName];
      delete this.filterForAPI[optionName];
    }

    if (params[name] && collection) {
      let confirmedValues = [];
      const values = params[name].split(',');
      for (let valueIdx in values) {
        if (values.hasOwnProperty(valueIdx)) {
          let value = values[valueIdx];
          const record = _.find(collection, [ identifyBy, value ]);
          if (record) {
            let optionArray = this.filterForUI[optionName];
            let recordExists = false;
            for (let optionIdx in optionArray) {
              if (optionArray[optionIdx]._id === record['_id']) {
                recordExists = true;
                break;
              }
            }

            if (!recordExists && optionArray) {
              optionArray.push(record);
            }

            confirmedValues.push(value);
          }
          if (confirmedValues.length) {
            if (optionName !== name) {
              this.filterForURL[optionName] =  encodeURI(confirmedValues.join(','));
              this.filterForAPI[optionName] = confirmedValues.join(',');
            }

            this.filterForURL[name] = encodeURI(confirmedValues.join(','));
            this.filterForAPI[name] = confirmedValues.join(',');
          }
        }
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

      this.paramsToDateFilters(params, 'decisionDateStart');
      this.paramsToDateFilters(params, 'decisionDateEnd');
    } else if (this.terms.dataset === 'Document') {
      this.paramsToCollectionFilters(params, 'milestone', this.milestones, '_id');
      this.paramsToCollectionFilters(params, 'documentAuthorType', this.authors, '_id');
      this.paramsToCollectionFilters(params, 'docType', this.docTypes, '_id');
      this.paramsToCollectionFilters(params, 'type', this.docTypes, '_id');

      this.paramsToDateFilters(params, 'datePostedStart');
      this.paramsToDateFilters(params, 'datePostedEnd');
    }
  }

  checkboxFilterToParams(params, name) {
    let keys = [];
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

      this.dateFilterToParams(params, 'decisionDateStart');
      this.dateFilterToParams(params, 'decisionDateEnd');
    } else if (this.terms.dataset === 'Document') {
      this.collectionFilterToParams(params, 'milestone', '_id');
      this.collectionFilterToParams(params, 'documentAuthorType', '_id');
      this.collectionFilterToParams(params, 'docType', '_id');

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
  }

  // reload page with current search terms
  public onSubmit() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    let params = this.terms.getParams();
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

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
