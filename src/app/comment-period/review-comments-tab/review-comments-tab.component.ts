import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewCommentsTabTableRowsComponent } from './review-comments-tab-table-rows/review-comments-tab-table-rows.component';
import { CommentService } from 'src/app/services/comment.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { Comment } from 'src/app/models/comment';

@Component({
  selector: 'app-review-comments-tab',
  templateUrl: './review-comments-tab.component.html',
  styleUrls: ['./review-comments-tab.component.scss']
})

export class ReviewCommentsTabComponent implements OnInit, OnDestroy {
  public comments: Array<Comment>;
  public loading = true;

  public filter = {
    'pending': false,
    'published': false,
    'deferred': false,
    'rejected': false
  };

  public commentTableData: TableObject;
  public commentTableColumns: any[] = [
    {
      name: 'ID',
      value: 'commentId',
      width: '10%'
    },
    {
      name: 'Name',
      value: 'author',
      width: '20%'
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: '15%'
    },
    {
      name: 'Attachments',
      value: 'null',
      width: '15%',
      nosort: true
    },
    {
      name: 'Location',
      value: 'location',
      width: '15%'
    },
    {
      name: 'Status',
      value: 'eaoStatus',
      width: '15%'
    },
    {
      name: 'CAC',
      value: 'submittedCAC',
      width: '10%'
    }
  ];

  public tableParams: TableParamsObject = new TableParamsObject();
  public commentPeriodId: string;
  public baseRouteUrl: string;

  private subscriptions = new Subscription();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private commentService: CommentService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    if (this.storageService.state.commentReviewTabParams == null) {
      this.route.params
        .subscribe(params => {
          this.commentPeriodId = params.commentPeriodId;
          this.filter.pending = params.pending == null || params.pending === 'false' ? false : true;
          this.filter.published = params.published == null || params.published === 'false' ? false : true;
          this.filter.deferred = params.deferred == null || params.deferred === 'false' ? false : true;
          this.filter.rejected = params.rejected == null || params.rejected === 'false' ? false : true;
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, this.filter);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '-commentId';
          }
        });
    } else {
      this.commentPeriodId = this.storageService.state.commentReviewTabParams.commentPeriodId;
      this.filter = this.storageService.state.commentReviewTabParams.filter;
      this.tableParams = this.storageService.state.commentReviewTabParams.tableParams;
      this.storageService.state.commentReviewTabParams = null;
    }

    this.baseRouteUrl = this.storageService.state.currentProject.type === 'currentProject' ? '/p' : '/pn';
    this.storageService.state.selectedTab = 0;

    this.subscriptions.add(
      this.commentService.getByPeriodId(
        this.commentPeriodId,
        this.tableParams.currentPage,
        this.tableParams.pageSize,
        this.tableParams.sortBy,
        true,
        this.filter)
        .subscribe((res: any) => {
          if (res) {
            this.tableParams.totalListItems = res.totalCount;
            if (this.tableParams.totalListItems > 0) {
              this.comments = res.data;
              this.setCommentRowData();

              // If there is a published comment, we are not allowed to delete the comment period.
              let canDelete = true;
              for (const comment of this.comments) {
                if (comment.eaoStatus === 'Published') {
                  canDelete = false;
                  break;
                }
              }
              this.storageService.state.canDeleteCommentPeriod = { type: 'canDeleteCommentPeriod', data: canDelete };
            } else {
              this.storageService.state.canDeleteCommentPeriod = { type: 'canDeleteCommentPeriod', data: true };
            }
            this.storageService.state.commentReviewTabParams = { tableParams: this.tableParams, filter: this.filter, commentPeriodId: this.commentPeriodId };
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load comments');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        })
    );
  }

  public togglePending() {
    this.filter.pending = !this.filter.pending;
    this.getPaginatedComments(1);
  }
  public togglePublished() {
    this.filter.published = !this.filter.published;
    this.getPaginatedComments(1);
  }
  public toggleDeferred() {
    this.filter.deferred = !this.filter.deferred;
    this.getPaginatedComments(1);
  }
  public toggleRejected() {
    this.filter.rejected = !this.filter.rejected;
    this.getPaginatedComments(1);
  }

  setCommentRowData() {
    const commentList = [];
    this.comments.map(comment => {
      commentList.push(
        {
          _id: comment._id,
          // Safety check if documents are null or are present with an emtpy array
          attachments: comment.documents !== null ? comment.documents.length : 0,
          commentId: comment.commentId,
          author: comment.author,
          comment: comment.comment,
          dateAdded: comment.dateAdded,
          eaoStatus: comment.eaoStatus,
          location: comment.location,
          period: comment.period,
          submittedCAC: comment.submittedCAC
        }
      );
    });
    this.commentTableData = new TableObject(
      ReviewCommentsTabTableRowsComponent,
      commentList,
      this.tableParams,
      { baseRouteUrl: this.baseRouteUrl }
    );
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedComments(this.tableParams.currentPage);
  }

  getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.subscriptions.add(
      this.commentService.getByPeriodId(this.commentPeriodId, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy, true, this.filter)
        .subscribe((res: any) => {
          this.tableParams.totalListItems = res.totalCount;
          this.comments = res.data;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filter);
          this.setCommentRowData();

          this.storageService.state.commentReviewTabParams = { tableParams: this.tableParams, filter: this.filter, commentPeriodId: this.commentPeriodId };
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
