import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { TableDocumentParamsObject } from '../components/table-template/table-document-params-object';
import { Constants } from './constants';

@Injectable()
export class TableDocumentTemplateUtils {
  constructor(
    private platformLocation: PlatformLocation,
    private router: Router
  ) { }

  public updateUrl(sortByCategorized, currentPageCategorized, pageSizeCategorized, filter = null, keywords = '') {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];

    currentUrl += `;currentPageCategorized=${currentPageCategorized};pageSizeCategorized=${pageSizeCategorized}`;

    if (keywords !== '') { currentUrl += `;keywords=${keywords}`; }

    if (sortByCategorized !== '' && sortByCategorized !== null) {
      currentUrl += `;sortByCategorized=${sortByCategorized}`;
    }

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
    let pageSizeCategorized = +Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    if (defaultPageSize !== null) {
      pageSizeCategorized = +defaultPageSize;
    } else if (params.pageSizeCategorized) {
      pageSizeCategorized = +params.pageSizeCategorized;
    }
    let currentPageCategorized = params.currentPageCategorized ? +params.currentPageCategorized : +Constants.tableDefaults.DEFAULT_CURRENT_PAGE;
    let sortByCategorized = params.sortByCategorized ? params.sortByCategorized : Constants.tableDefaults.DEFAULT_SORT_BY;

    let keywords = params.keywords ? params.keywords : Constants.tableDefaults.DEFAULT_KEYWORDS;
    if (filter == null) {
      filter = {};
    }
    filterFieldList.map(field => {
      if (params[field]) {
        filter[field] = params[field];
      }
    });

    this.updateUrl(sortByCategorized, currentPageCategorized, pageSizeCategorized, filter, keywords);

    return new TableDocumentParamsObject(
      pageSizeCategorized,
      currentPageCategorized,
      0,
      sortByCategorized,
      keywords,
      filter
    );
  }

  public updateTableParams(documentType: string, tableParams: TableDocumentParamsObject, pageNumber: number) {
    if (documentType === Constants.documentTypes.CATEGORIZED) {
      tableParams.currentPageCategorized = pageNumber;
    }

    return tableParams;
  }
}
