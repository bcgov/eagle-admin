import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';

import * as _ from 'lodash';

import { Org } from 'app/models/org';

import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

import { OrgService } from 'app/services/org.service';
import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectListResolver implements Resolve<Object> {
  public proponents: Array<Org> = [];
  public regions: Array<object> = [];
  public ceaaInvolvements: Array<object> = [];
  public projectPhases: Array<object> = [];

  public filterForURL: object = {};
  public filterForAPI: object = {};

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
    private orgService: OrgService,
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    // Fetch proponents and other collections
    // TODO: Put all of these into Lists
    return this.orgService.getByCompanyType('Proponent/Certificate Holder')
      .switchMap((res: any) => {
        this.proponents = res || [];

        this.regions = this.REGIONS_COLLECTION;
        this.ceaaInvolvements = this.CEAA_INVOLVEMENTS_COLLECTION;

        this.setFiltersFromParams(route.params);

        let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, this.filterForURL);
        if (tableParams.sortBy === '') {
          tableParams.sortBy = '+name';
          this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, this.filterForURL, tableParams.keywords);
        }

        // if we're searching for projects, replace projectPhase with currentPhaseName
        // The code is called projectPhase, but the db column on projects is currentPhaseName
        // so the rename is required to pass in the correct query
        if (route.params.hasOwnProperty('projectPhase')) {
          this.filterForAPI['currentPhaseName'] = route.params['projectPhase'];
          delete this.filterForAPI['projectPhase'];
        }

        return this.searchService.getSearchResults(
          tableParams.keywords,
          'Project',
          null,
          tableParams.currentPage,
          tableParams.pageSize,
          tableParams.sortBy,
          {},
          true,
          this.filterForAPI,
          ''
        );
      });
  }

  paramsToCheckboxFilters(params, name, map) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];

      const values = params[name].split(',');
      let apiValues = values.map(value => {
        return map && map[value] ? map[value] : value;
      });
      if (apiValues.length) {
        this.filterForAPI[name] = apiValues.join(',');
      }
    }
  }

  paramsToCollectionFilters(params, name, collection, identifyBy) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name] && collection) {
      let confirmedValues = [];
      // look up each value in collection
      const values = params[name].split(',');
      values.forEach(value => {
        const record = _.find(collection, [ identifyBy, value ]);
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

  paramsToDateFilters(params, name) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];
      this.filterForAPI[name] = params[name];
    }
  }

  setFiltersFromParams(params) {
    this.paramsToCheckboxFilters(params, 'type', this.TYPE_MAP);
    this.paramsToCheckboxFilters(params, 'eacDecision', this.EAC_DECISIONS_MAP);
    this.paramsToCheckboxFilters(params, 'pcp', this.PCP_MAP);

    this.paramsToCollectionFilters(params, 'region', this.regions, 'code');
    this.paramsToCollectionFilters(params, 'CEAAInvolvement', this.ceaaInvolvements, 'code');
    this.paramsToCollectionFilters(params, 'proponent', this.proponents, '_id');
    this.paramsToCollectionFilters(params, 'vc', null, '_id');
    this.paramsToCollectionFilters(params, 'projectPhase', this.projectPhases, '_id');

    this.paramsToDateFilters(params, 'decisionDateStart');
    this.paramsToDateFilters(params, 'decisionDateEnd');
  }
}
