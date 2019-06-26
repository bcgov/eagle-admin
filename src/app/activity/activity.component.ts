import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { RecentActivity } from 'app/models/recentActivity';

import { ActivityTableRowsComponent } from './activity-table-rows/activity-table-rows.component';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { SearchTerms } from 'app/models/search';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public entries: RecentActivity[] = null;
  public terms = new SearchTerms();
  public searchForm = null;
  public typeFilters = [];
  public filterPublicCommentPeriod = false;
  public filterNews = false;

  public tableColumns: any[] = [
    {
      name: 'Pin',
      value: 'pinned',
      width: 'col-1'
    },
    {
      name: 'Headline',
      value: 'headline',
      width: 'col-3'
    },
    {
      name: 'Project',
      value: 'project.name',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: 'col-2'
    },
    {
      name: 'Status',
      value: 'active',
      width: 'col-1'
    },
    {
      name: 'Delete',
      width: 'col-1',
      nosort: true
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
  ) { }

  ngOnInit() {
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        // this.filter.dateAddedStart = params.dateAddedStart == null || params.dateAddedStart === '' ? null : this.utils.convertJSDateToNGBDate(new Date(params.dateAddedStart));
        // this.filter.dateAddedEnd = params.dateAddedEnd == null || params.dateAddedEnd === '' ? null : this.utils.convertJSDateToNGBDate(new Date(params.dateAddedEnd));
        if (params.type != null) {
          this.typeFilters = params.type.split(',');
          if (this.typeFilters.includes('publicCommentPeriod')) { this.filterPublicCommentPeriod = true; }
          if (this.typeFilters.includes('news')) { this.filterNews = true; }
        }

        let filterForUrl = params.type == null ? null : { 'type': params.type };
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, filterForUrl);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '-dateAdded';
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, filterForUrl, this.tableParams.keywords);
        }
        this.route.data
          .takeUntil(this.ngUnsubscribe)
          .subscribe((res: any) => {
            if (res) {
              if (res.activities[0].data.meta && res.activities[0].data.meta.length > 0) {
                this.tableParams.totalListItems = res.activities[0].data.meta[0].searchResultsTotal;
                this.entries = res.activities[0].data.searchResults;
              } else {
                this.tableParams.totalListItems = 0;
                this.entries = [];
              }
              this.setRowData();
              this.loading = false;
              this._changeDetectionRef.detectChanges();
            } else {
              alert('Uh-oh, couldn\'t load valued components');
              // project not found --> navigate back to search
              this.router.navigate(['/search']);
            }
          });
      });
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'add':
        // Add activity
        this.router.navigate(['/activity', 'add']);
        break;
    }
  }

  setRowData() {
    let list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach(item => {
        list.push(
          {
            _id: item._id,
            project: item.project,
            headline: item.headline,
            type: item.type,
            dateAdded: item.dateAdded,
            active: item.active,
            pinned: item.pinned
          }
        );
      });
      this.tableData = new TableObject(
        ActivityTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  public onSubmit(pageNumber = 1, reset = false) {
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;
    this._changeDetectionRef.detectChanges();

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;

    if (reset) {
      this.tableParams.sortBy = '';
      this.tableParams.pageSize = 10;
      this.tableParams.keywords = '';
      // this.filter.dateAddedStart = '';
      // this.filter.dateAddedEnd = '';
      this.typeFilters = [];
    } else {
      params['sortBy'] = this.tableParams.sortBy;
      params['pageSize'] = this.tableParams.pageSize;
      params['keywords'] = this.tableParams.keywords;
      // params['dateAddedStart'] = this.utils.convertFormGroupNGBDateToJSDate(this.filter.dateAddedStart).toISOString();
      // params['dateAddedEnd'] = this.utils.convertFormGroupNGBDateToJSDate(this.filter.dateAddedEnd).toISOString();
    }

    if (this.typeFilters.length > 0) { params['type'] = this.typeFilters.toString(); }
    this.router.navigate(['activity', params]);
  }

  public toggleFilter(filterItem) {
    if (this.typeFilters.includes(filterItem)) {
      this.typeFilters = this.typeFilters.filter(item => item !== filterItem);
    } else {
      this.typeFilters.push(filterItem);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
