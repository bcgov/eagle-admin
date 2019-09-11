import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';

import * as _ from 'lodash';

import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class DocumentsResolver implements Resolve<Observable<object>> {
  private milestones: any[] = [];
  private authors: any[] = [];
  private types: any[] = [];

  private filterForAPI: object = {};

  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    // Get the lists first
    return this.searchService.getFullList('List')
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
                this.types.push({ ...item });
                break;
              default:
                break;
            }
          });
        }

        // Validate the filter parameters being sent to the API
        this.setFilterFromParams(route.params);

        const projectId = route.parent.paramMap.get('projId');

        const params = this.storageService.state.projectDocumentTableParams || route.params;

        const pageNum = params.pageNum ? params.pageNum : 1;
        const pageSize = params.pageSize ? params.pageSize : 10;
        const sortBy = params.sortBy ? params.sortBy : '-datePosted';
        const keywords = params.keywords || '';

        return this.searchService.getSearchResults(
          keywords,
          'Document',
          [{ 'name': 'project', 'value': projectId }],
          pageNum,
          pageSize,
          sortBy,
          { documentSource: 'PROJECT' },
          true,
          this.filterForAPI);
      });
  }

  paramsToCollectionFilter(params, name, collection, identifyBy) {
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
        this.filterForAPI[name] = confirmedValues.join(',');
      }
    }
  }

  paramsToDateFilter(params, name) {
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForAPI[name] = params[name];
    }
  }

  setFilterFromParams(params) {
    this.paramsToCollectionFilter(params, 'milestone', this.milestones, '_id');
    this.paramsToCollectionFilter(params, 'documentAuthorType', this.authors, '_id');
    this.paramsToCollectionFilter(params, 'type', this.types, '_id');

    this.paramsToDateFilter(params, 'datePostedStart');
    this.paramsToDateFilter(params, 'datePostedEnd');
  }
}
