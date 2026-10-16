import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { TableParamsObject } from '../components/table-template/table-params-object';
import { Constants } from './constants';

// Same column flips direction; a new column starts ascending.
export function nextSortBy(current: string, column: string): string {
  return current === `+${column}` ? `-${column}` : `+${column}`;
}

/**
 * DEMI `sort` for a table `sortBy` whose first column is one of `keys`, descending when it starts with `-`.
 * Any other column (an old URL, a multi-key sort) falls back to `fallback` as given.
 */
export function nativeSort(sortBy: string | null | undefined, fallback: string, keys: readonly string[] = [fallback]): string {
  const first = sortBy?.split(',')[0] ?? '';
  const key = first.replace(/^[+-]/, '');
  if (!keys.includes(key)) {
    return fallback;
  }
  return first.startsWith('-') ? `-${key}` : key;
}

/** Table `sortBy` for a DEMI sort, so the header arrow matches what the list was sorted by. */
export function tableSort(sort: string): string {
  return sort.startsWith('-') ? sort : `+${sort}`;
}

@Injectable({ providedIn: 'root' })
export class TableTemplateUtils {
  private platformLocation = inject(PlatformLocation);
  private router = inject(Router);


  /** Writes table state to the URL as matrix params. Values are escaped; a filter's commas stay as list separators. */
  public updateUrl(sortString, currentPage, pageSize, filter = null, keywords = '') {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];
    currentUrl += `;currentPage=${currentPage};pageSize=${pageSize}`;
    if (keywords) { currentUrl += `;keywords=${encodeURIComponent(keywords)}`; }
    if (sortString) { currentUrl += `;sortBy=${encodeURIComponent(sortString)}`; }
    if (filter !== null && Object.keys(filter).length > 0) {
      Object.keys(filter).forEach(key => {
        if (filter[key] === true || filter[key] === false) {
          currentUrl += `;${key}=${filter[key]}`;
        } else {
          currentUrl += `;${key}=${filter[key].split(',').map(encodeURIComponent).join(',')}`;
        }
      });
    }
    currentUrl += ';ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  public getParamsFromUrl(params, filter = null, defaultPageSize = null, filterFieldList = []) {
    let pageSize = +Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    if (params.pageSize) {
      pageSize = +params.pageSize;
    } else if (defaultPageSize !== null) {
      pageSize = +defaultPageSize;
    }
    const currentPage = params.currentPage ? +params.currentPage : +Constants.tableDefaults.DEFAULT_CURRENT_PAGE;
    const sortBy = params.sortBy ? params.sortBy : Constants.tableDefaults.DEFAULT_SORT_BY;
    const keywords = params.keywords ? params.keywords : Constants.tableDefaults.DEFAULT_KEYWORDS;
    if (filter == null) {
      filter = {};
    }
    filterFieldList.map(field => {
      if (params[field]) {
        filter[field] = params[field];
      }
    });

    this.updateUrl(sortBy, currentPage, pageSize, filter, keywords);

    return new TableParamsObject(
      pageSize,
      currentPage,
      0,
      sortBy,
      keywords,
      filter
    );
  }

  public updateTableParams(tableParams: TableParamsObject, pageNumber: number, sortBy: string) {
    tableParams.sortBy = sortBy;
    tableParams.currentPage = pageNumber;
    return tableParams;
  }
}
