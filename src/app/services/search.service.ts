import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { SearchResults } from '../models/search';

@Injectable()
export class SearchService {

  public isError = false;
  // This might get large
  private _cachedItems = {};
  constructor(
    private api: ApiService
  ) { }


  getItem(_id: string, schema: string, useCache = false): Observable<any> {
    if (this._cachedItems && this._cachedItems.hasOwnProperty(_id), useCache) {
      // TODO: Revisit this but for now its disabled
      return of(this._cachedItems[_id]);
    }
    const searchResults = this.api.getItem(_id, schema)
      .map(res => {
        const allResults = <any>[];
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

  getSearchResults(keys: string, dataset: string, fields: any[], pageNum = 1, pageSize = 10, sortBy: string = null, queryModifier: object = {}, populate = false, filter: object = {}, projectLegislation = ''): Observable<SearchResults[]> {
    if (sortBy === '') {
      sortBy = null;
    }
    const searchResults = this.api.searchKeywords(keys, dataset, fields, pageNum, pageSize, projectLegislation, sortBy, queryModifier, populate, filter)
      .map(res => {
        const allResults = <any>[];
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
