import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { RecentActivity } from 'app/models/recentActivity';

import { SearchService } from 'app/services/search.service';

import { ActivityTableRowsComponent } from './activity-table-rows/activity-table-rows.component';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public entries: RecentActivity[] = null;

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
    private searchService: SearchService,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
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
      }
      );
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
    this.getPaginated(this.tableParams.currentPage);
  }

  getPaginated(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.searchService.getSearchResults('',
      'RecentActivity',
      null,
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      null,
      true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res[0].data.meta && res[0].data.meta.length > 0) {
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
          this.entries = res[0].data.searchResults;
        }
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

}
