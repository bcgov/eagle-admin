import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { TableParamsObject } from '../components/table-template/table-params-object';
import { Constants } from './constants';

@Injectable()
export class TableTemplateUtils {
  private platformLocation = inject(PlatformLocation);
  private router = inject(Router);


  public updateUrl(sortString, currentPage, pageSize, filter = null, keywords = '') {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];
    currentUrl += `;currentPage=${currentPage};pageSize=${pageSize}`;
    if (keywords !== '') { currentUrl += `;keywords=${keywords}`; }
    if (sortString !== '' && sortString !== null) { currentUrl += `;sortBy=${sortString}`; }
    if (filter !== null && Object.keys(filter).length > 0) {
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

  public getParamsFromUrl(params, filter = null, defaultPageSize = null, filterFieldList = []) {
    let pageSize = +Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    if (defaultPageSize !== null) {
      pageSize = +defaultPageSize;
    } else if (params.pageSize) {
      pageSize = +params.pageSize;
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
