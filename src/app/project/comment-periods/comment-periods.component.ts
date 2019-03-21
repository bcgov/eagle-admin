import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { Subject } from 'rxjs';

import { CommentPeriod } from 'app/models/commentPeriod';
import { TableObject } from 'app/shared/components/table-template/table-object';

import { CommentPeriodTableRowsComponent } from 'app/project/comment-periods/comment-period-table-rows/comment-period-table-rows.component';

import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-comment-periods',
  templateUrl: './comment-periods.component.html',
  styleUrls: ['./comment-periods.component.scss']
})
export class CommentPeriodsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private currentProjectId;


  public commentPeriods: CommentPeriod[] = null;
  public commentPeriodTableColumns: any[] = [
    {
      name: 'Status',
      value: 'commentPeriodStatus'
    },
    {
      name: 'Start Date',
      value: 'dateStarted'
    },
    {
      name: 'End Date',
      value: 'dateCompleted'
    },
    {
      name: 'Published',
      value: 'isPublished'
    },
    {
      name: 'Comment Data',
      value: 'commentData'
    }
  ];
  public commentPeriodTableData: TableObject;
  public loading = true;

  public pageNum = 0;
  public sortBy = '';
  public sortDirection = 0;
  public pageSize = 10;
  public currentPage = 1;
  public totalListItems = 0;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private commentPeriodService: CommentPeriodService,
    private platformLocation: PlatformLocation,
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (res: any) => {
          if (res) {
            this.loading = false;
            this.totalListItems = res.commentPeriods.totalCount;
            this.commentPeriods = res.commentPeriods.data;
            this.currentProjectId = this.commentPeriods[0].project;
            this.initCPRowData();
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
            this.loading = false;
          }
        }
      );
  }

  setColumnSort(column) {
    this.sortBy = column;
    this.sortDirection = this.sortDirection > 0 ? -1 : 1;
    this.getPaginatedComments(this.currentPage, this.sortBy, this.sortDirection);
  }

  initCPRowData() {
    let cpList = [];
    this.commentPeriods.forEach(commentPeriod => {
      // Determine if the CP is published by checking in read is Public
      let isPublished = 'Not Published';
      commentPeriod.read.forEach(element => {
        if (element === 'public') {
          isPublished = 'Published';
        }
      });

      cpList.push(
        {
          commentPeriodStatus: commentPeriod.commentPeriodStatus,
          dateStarted: commentPeriod.dateStarted,
          dateCompleted: commentPeriod.dateCompleted,
          read: isPublished,
          // TODO: Figure out pending, deferred, published, rejected
          // commmentData:
        }
      );
    });
    this.commentPeriodTableData = new TableObject(
      CommentPeriodTableRowsComponent,
      cpList,
      {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        totalListItems: this.totalListItems,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection
      }
    );
  }

  public getPaginatedComments(pageNumber, sortBy, sortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    if (sortBy === undefined) {
      sortBy = this.sortBy;
      sortDirection = this.sortDirection;
    }

    let sorting = (sortDirection > 0 ? '+' : '-') + sortBy;

    this.commentPeriodService.getAllByProjectId(this.currentProjectId, pageNumber, this.pageSize, sorting)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = this.sortDirection;
        this.updateUrl(sorting);
        this.totalListItems = res.totalCount;
        this.commentPeriods = res.data;
        this.loading = false;
        this.initCPRowData();
        this._changeDetectionRef.detectChanges();
      });
  }

  updateUrl(sorting) {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.currentPage}&pageSize=${this.pageSize}`;
    currentUrl += `&sortBy=${sorting}`;
    currentUrl += '&ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
