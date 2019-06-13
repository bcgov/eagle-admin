import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { TableParamsObject } from '../components/table-template/table-params-object';
import { Constants } from 'app/shared/utils/constants';

@Injectable()
export class TableTemplateUtils {
  constructor(
    private platformLocation: PlatformLocation,
    private router: Router
  ) { }

  public updateUrl(sortString, currentPage, pageSize, filter = null, keywords = '') {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];
    currentUrl += `;currentPage=${currentPage};pageSize=${pageSize}`;
    if (keywords !== '') { currentUrl += `;keywords=${keywords}`; }
    if (sortString !== '' && sortString !== null) { currentUrl += `;sortBy=${sortString}`; }
    if (filter !== null && filter !== {}) {
      Object.keys(filter).forEach(key => {
        if (filter[key] === true || filter[key] === false) {
          currentUrl += `;${key}=${filter[key]}`;
        } else {
          currentUrl += `;${key}=`;
          filter[key].split(',').forEach(item => {
            currentUrl += `${item},`;
          });
          currentUrl = currentUrl.slice(0, -1);
        }
      });
    }
    currentUrl += ';ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  public getParamsFromUrl(params, filter = null) {
    let pageSize = params.pageSize || Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    let currentPage = params.currentPage ? params.currentPage : Constants.tableDefaults.DEFAULT_CURRENT_PAGE;
    let sortBy = params.sortBy ? params.sortBy : Constants.tableDefaults.DEFAULT_SORT_BY;
    let keywords = params.keywords ? params.keywords : Constants.tableDefaults.DEFAULT_KEYWORDS;

    this.updateUrl(sortBy, currentPage, pageSize, filter, keywords);

    return new TableParamsObject(
      pageSize,
      currentPage,
      0,
      sortBy,
      keywords
    );
  }

  public updateTableParams(tableParams: TableParamsObject, pageNumber: number, sortBy: string) {
    tableParams.sortBy = sortBy;
    tableParams.currentPage = pageNumber;
    return tableParams;
  }
}
