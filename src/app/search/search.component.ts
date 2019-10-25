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

// TODO: Project and Document filters should be made into components
// What a mess otherwise!
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

  private TYPE_MAP: object = {
    energyElectricity: 'Energy-Electricity',
    energyPetroleum: 'Energy-Petroleum & Natural Gas',
    foodProcessing: 'Food Processing',
    industrial: 'Industrial',
    mines: 'Mines',
    other: 'Other',
    tourist: 'Tourist Destination Resorts',
    transportation: 'Transportation',
    wasteDisposal: 'Waste Disposal',
    waterManagement: 'Water Management'
  };

  private EAC_DECISIONS_MAP: object = {
    inProgress: 'In Progress',
    certificateIssued: 'Certificate Issued',
    certificateRefused: 'Certificate Refused',
    furtherAssessmentRequired: 'Further Assessment Required',
    certificateNotRequired: 'Certificate Not Required',
    certificateExpired: 'Certificate Expired',
    withdrawn: 'Withdrawn',
    terminated: 'Terminated',
    preEA: 'Pre-EA Act Approval',
    notReviewable: 'Not Designated Reviewable'
  };

  private PCP_MAP: object = {
    pending: 'pending',
    open: 'open',
    closed: 'closed'
  };

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

  private CEAA_INVOLVEMENTS_COLLECTION: Array<object> = [
    { code: 'None', name: 'None' },
    { code: 'Panel', name: 'Panel' },
    { code: 'Panel (CEAA 2012)', name: 'Panel (CEAA 2012)' },
    { code: 'Coordinated', name: 'Coordinated' },
    { code: 'Screening', name: 'Screening' },
    { code: 'Screening - Confirmed', name: 'Screening - Confirmed' },
    { code: 'Substituted', name: 'Substituted' },
    { code: 'Substituted (Provincial Lead)', name: 'Substituted (Provincial Lead)' },
    { code: 'Comprehensive Study', name: 'Comprehensive Study' },
    { code: 'Comprehensive Study - Unconfirmed', name: 'Comprehensive Study - Unconfirmed' },
    { code: 'Comprehensive Study - Confirmed', name: 'Comprehensive Study - Confirmed' },
    { code: 'Comprehensive Study (Pre CEAA 2012)', name: 'Comprehensive Study (Pre CEAA 2012)' },
    { code: 'Comp Study', name: 'Comp Study' },
    { code: 'Comp Study - Unconfirmed', name: 'Comp Study - Unconfirmed' },
    { code: 'To be determined', name: 'To be determined' },
    { code: 'Equivalent - NEB', name: 'Equivalent - NEB' },
    { code: 'Yes', name: 'Yes' }
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
              default:
                break;
            }
          });
        }

        // This code reorders the document type list defined by EAO (See Jira Ticket EAGLE-88)
        // todo how are we handling these lists with legislation year in advanced search? EE-406
        // this.docTypes = this.docTypes.filter(item => item.legislation === 2002);
        this.docTypes.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);

        // Fetch proponents and other collections
        // TODO: Put all of these into Lists
        return this.orgService.getByCompanyType('Proponent/Certificate Holder');
      })
      .switchMap((res: any) => {
        this.proponents = res || [];

        this.regions = this.REGIONS_COLLECTION;
        this.ceaaInvolvements = this.CEAA_INVOLVEMENTS_COLLECTION;

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

        return this.searchService.getSearchResults(
          this.terms.keywords,
          this.terms.dataset,
          null,
          this.currentPage,
          this.pageSize,
          null,
          '',
          {},
          true,
          this.filterForAPI
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
    const paramname = name === 'docType' ? 'type' : name;

    this.filterForUI[name] = [];
    delete this.filterForURL[paramname];
    delete this.filterForAPI[paramname];

    if (params[paramname] && collection) {
      let confirmedValues = [];
      // look up each value in collection
      const values = params[paramname].split(',');
      values.forEach(value => {
        const record = _.find(collection, [ identifyBy, value ]);
        if (record) {
          this.filterForUI[name].push(record);
          confirmedValues.push(value);
        }
      });
      if (confirmedValues.length) {
        this.filterForURL[paramname] = confirmedValues.join(',');
        this.filterForAPI[paramname] = confirmedValues.join(',');
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
      this.paramsToCheckboxFilters(params, 'projectType', this.TYPE_MAP);
      this.paramsToCheckboxFilters(params, 'eacDecision', this.EAC_DECISIONS_MAP);
      this.paramsToCheckboxFilters(params, 'pcp', this.PCP_MAP);

      this.paramsToCollectionFilters(params, 'region', this.regions, 'code');
      this.paramsToCollectionFilters(params, 'CEAAInvolvement', this.ceaaInvolvements, 'code');
      this.paramsToCollectionFilters(params, 'proponent', this.proponents, '_id');
      this.paramsToCollectionFilters(params, 'vc', null, '_id');

      this.paramsToDateFilters(params, 'decisionDateStart');
      this.paramsToDateFilters(params, 'decisionDateEnd');
    } else if (this.terms.dataset === 'Document') {
      this.paramsToCollectionFilters(params, 'milestone', this.milestones, '_id');
      this.paramsToCollectionFilters(params, 'documentAuthorType', this.authors, '_id');
      this.paramsToCollectionFilters(params, 'docType', this.docTypes, '_id');

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
      params[name === 'docType' ? 'type' : name] = values.join(',');
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
      this.checkboxFilterToParams(params, 'projectType');
      this.checkboxFilterToParams(params, 'eacDecision');
      this.checkboxFilterToParams(params, 'pcp');

      this.collectionFilterToParams(params, 'region', 'code');
      this.collectionFilterToParams(params, 'CEAAInvolvement', 'code');
      this.collectionFilterToParams(params, 'proponent', '_id');
      this.collectionFilterToParams(params, 'vc', '_id');

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

  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
