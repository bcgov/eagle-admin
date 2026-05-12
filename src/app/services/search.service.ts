import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { LoadingStateService } from './loading-state.service';
import { ToastService } from './toast.service';
import { LoggingService } from './logging.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { SearchResults } from '../models/search';
import { encodeString } from '../shared/utils/utils';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private api = inject(ApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  private _cachedItems = {};

  getItem(_id: string, schema: string, useCache = false): Observable<any> {
    if (useCache && this._cachedItems.hasOwnProperty(_id)) {
      return of(this._cachedItems[_id]);
    }
    return this.api.get<SearchResults[]>(`search?dataset=Item&_id=${_id}&_schemaName=${schema}`).pipe(
      withLoading(this.loadingState, `search-item-${_id}`),
      map(res => {
        const allResults = <any>[];
        res.forEach((item: any) => {
          allResults.push(new SearchResults({ type: item._schemaName, data: item }));
        });
        if (allResults.length === 1) {
          this._cachedItems[_id] = allResults[0];
          return allResults[0];
        }
        return {};
      }),
      catchError(error => {
        this.logger.error('Failed to load item', 'SearchService', error);
        this.toast.error('Failed to load data.');
        return of([] as SearchResults[]);
      })
    );
  }

  getSearchResults(
    keys: string, dataset: string, fields: any[], pageNum = 1, pageSize = 10,
    sortBy: string = null, queryModifier: object = {}, populate = false,
    filter: object = {}, projectLegislation = ''
  ): Observable<SearchResults[]> {
    if (sortBy === '') { sortBy = null; }
    const legislation = (projectLegislation === '') ? 'default' : projectLegislation;
    let qs = `search?dataset=${dataset}`;
    if (fields && fields.length > 0) {
      fields.forEach(item => { qs += `&${item.name}=${item.value}`; });
    }
    if (keys) { qs += `&keywords=${encodeURIComponent(keys)}`; }
    if (pageNum !== null) { qs += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { qs += `&pageSize=${pageSize}`; }
    if (legislation !== '') { qs += `&projectLegislation=${legislation}`; }
    if (sortBy !== '' && sortBy !== null) { qs += `&sortBy=${sortBy}`; }
    if (populate !== null) { qs += `&populate=${populate}`; }
    Object.keys(queryModifier).forEach(key => {
      (queryModifier[key] as string).split(',').forEach(item => { qs += `&and[${key}]=${item}`; });
    });
    Object.keys(filter).forEach(key => {
      (filter[key] as string).split(',').forEach(item => {
        const safeItem = item.includes('&') ? encodeString(item, true) : item;
        qs += `&and[${key}]=${safeItem}`;
      });
    });
    qs = encodeURI(qs);
    return this.api.get<SearchResults[]>(qs).pipe(
      withLoading(this.loadingState, 'search-results'),
      map(res => {
        const allResults = <any>[];
        res.forEach((item: any) => {
          allResults.push(new SearchResults({ type: item._schemaName, data: item }));
        });
        return allResults;
      }),
      catchError(error => {
        this.logger.error('Search failed', 'SearchService', error);
        this.toast.error('Search failed. Please try again.');
        return of([new SearchResults({ type: null, data: { searchResults: [], meta: [{ searchResultsTotal: 0 }] } })]);
      })
    );
  }

  getMetrics(pageNum: number, pageSize: number, sortBy: string = null): Observable<SearchResults[]> {
    const fields = [
      'fields', 'performedBy', 'deletedBy', 'updatedBy', 'addedBy', 'meta',
      'action', 'objId', 'keywords', 'timestamp', '_objectSchema'
    ];
    let qs = `audit?`;
    if (pageNum !== null) { qs += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { qs += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { qs += `sortBy=${sortBy}&`; }
    qs += `fields=${this.api.buildValues(fields)}`;
    return this.api.get<SearchResults[]>(qs).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}
