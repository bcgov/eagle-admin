import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { CommentPeriod } from '../models/commentPeriod';
import { ApiService } from '../services/api';
import { CommentPeriodService } from '../services/commentperiod.service';
import { StorageService } from '../services/storage.service';
import { TableObject } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';
import { CommentPeriodsTableRowsComponent } from './comment-periods-table-rows/comment-periods-table-rows.component';

@Component({
  selector: 'app-comment-periods',
  templateUrl: './comment-periods.component.html',
  styleUrls: ['./comment-periods.component.scss']
})
export class CommentPeriodsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public commentPeriods: CommentPeriod[] = null;
  public commentPeriodTableColumns: any[] = [
    {
      name: 'Status',
      value: 'commentPeriodStatus',
      width: '10%'
    },
    {
      name: 'Start Date',
      value: 'dateStarted',
      width: '15%'
    },
    {
      name: 'End Date',
      value: 'dateCompleted',
      width: '15%'
    },
    {
      name: 'Days Remaining',
      value: 'daysRemaining',
      width: '15%'
    },
    {
      name: 'Published',
      value: 'isPublished',
      width: '15%'
    },
    {
      name: 'Comment Data',
      value: 'commentData',
      width: '30%',
      nosort: true
    }
  ];

  public commentPeriodTableData: TableObject;
  public loading = true;
  public currentProject;
  public baseRouteUrl: string;

  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private commentPeriodService: CommentPeriodService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;
    this.storageService.state.currentCommentPeriod = null;

    this.currentProject = this.storageService.state.currentProject;
    this.baseRouteUrl = this.currentProject.type === 'currentProject' ? '/p' : '/pn';
    this.storageService.state.commentReviewTabParams = null;

    this.route.params.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
      if (this.tableParams.sortBy === '') {
        this.tableParams.sortBy = '-dateStarted';
      }
    });
    this.storageService.state.selectedTab = 0;

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (res: any) => {
          if (res) {
            this.tableParams.totalListItems = res.commentPeriods.totalCount;
            if (this.tableParams.totalListItems > 0) {
              this.commentPeriods = res.commentPeriods.data;
            } else {
              this.tableParams.totalListItems = 0;
              this.commentPeriods = [];
            }
            this.setCPRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load comment periods');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );
  }

  setColumnSort(column) {
    this.tableParams.sortBy = (this.tableParams.sortBy.startsWith('+') ? '-' : '+') + column;
    this.getPaginatedComments(this.tableParams.currentPage);
  }

  setCPRowData() {
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
          daysRemaining: commentPeriod.daysRemaining,
          isMet: commentPeriod.isMet,
          metURLAdmin: commentPeriod.metURLAdmin,
          read: isPublished,
          // TODO: Figure out pending, deferred, published, rejected
          // commmentData:
          _id: commentPeriod._id,
          project: commentPeriod.project
        }
      );
    });
    this.commentPeriodTableData = new TableObject(
      CommentPeriodsTableRowsComponent,
      cpList,
      this.tableParams,
      { baseRouteUrl: this.baseRouteUrl }
    );
  }

  public getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.commentPeriodService.getAllByProjectId(this.currentProject.data._id, pageNumber, this.tableParams.pageSize, this.tableParams.sortBy)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.commentPeriods = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setCPRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  public addCommentPeriod() {
    this.storageService.state.currentProject = this.currentProject;

    if (this.currentProject.data.hasMetCommentPeriods) {
      let metURL;
      switch (this.api.env) {
        case 'prod':
        case 'demo':
        case 'hotfix':
          metURL = 'https://engage.eao.gov.bc.ca/';
          break;
        case 'test':
          metURL = 'https://test.engage.eao.gov.bc.ca/';
          break;
        case 'dev':
        case 'local':
        default:
          metURL = 'https://dev.engage.eao.gov.bc.ca/';
          break;
      }
      window.open(`${metURL}engagements/create/form/?project_id=${this.currentProject.data._id}`, '_blank');
    } else {
      this.router.navigate([this.baseRouteUrl, this.currentProject.data._id, 'comment-periods', 'add']);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
