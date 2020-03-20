import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { SearchResults } from 'app/models/search';

@Injectable()
export class SearchService {

  public isError = false;
  // This might get large
  private _cachedItems = {};
  constructor(
    private api: ApiService
  ) { }


  getItem(_id: string, schema: string): Observable<any> {
    if (this._cachedItems && this._cachedItems.hasOwnProperty(_id)) {
      // Check cache first
      return of(this._cachedItems[_id]);
    }
    const searchResults = this.api.getItem(_id, schema)
      .map(res => {
        let allResults = <any>[];
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          allResults.push(r);
        });
        if (allResults.length === 1) {
          this._cachedItems[_id] = allResults[0];
          return allResults[0];
        } else {
          return {};
        }
      })
      .catch(() => {
        this.isError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      });
    return searchResults;
  }

  getFullList(schema: string): Observable<any> {
    return this.api.getFullDataSet(schema);
  }

  getSearchResults(keys: string, dataset: string, fields: any[], pageNum: number = 1, pageSize: number = 10, sortBy: string = null, queryModifier: object = {}, populate: boolean = false, filter: object = {}, projectLegislation: string = ''): Observable<SearchResults[]> {
    if (sortBy === '') {
      sortBy = null;
    }
    const searchResults = this.api.searchKeywords(keys, dataset, fields, pageNum, pageSize, projectLegislation, sortBy, queryModifier, populate, filter)
      .map(res => {
        let allResults = <any>[];
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          allResults.push(r);
        });
        return allResults;
      })
      .catch(() => {
        this.isError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      });
    return searchResults;
  }
}
