import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ReviewCommentsTabTableRowsComponent } from './review-comments-tab-table-rows/review-comments-tab-table-rows.component';
import { CommentService } from 'src/app/services/comment.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils, nextSortBy } from 'src/app/shared/utils/table-template-utils';
import { DemiComment } from 'src/app/models/demi/comment';
import { DemiEaoStatus } from 'src/app/models/demi/comment-period';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';

const DEFAULT_SORT = '-dateAdded';
const STATUS_FILTERS: Record<string, DemiEaoStatus> = {
  pending: 'Pending', published: 'Published', deferred: 'Deferred', rejected: 'Rejected'
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-review-comments-tab',
  templateUrl: './review-comments-tab.component.html',
  styleUrl: './review-comments-tab.component.css',
  imports: [
    TableTemplateComponent
  ]
})

export class ReviewCommentsTabComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private commentService = inject(CommentService);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private tableTemplateUtils = inject(TableTemplateUtils);

  project = input.required<any>();

  public comments: Array<DemiComment>;
  public loading = true;

  public filter = {
    'pending': false,
    'published': false,
    'deferred': false,
    'rejected': false
  };

  public commentTableData: TableObject;
  public commentTableColumns: TableColumn[] = [
    {
      name: 'ID',
      value: 'commentId',
      width: '10%',
      nosort: true
    },
    {
      name: 'Name',
      value: 'author',
      width: '20%',
      nosort: true
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
      width: '15%',
      nosort: true
    },
    {
      name: 'Status',
      value: 'eaoStatus',
      width: '15%',
      nosort: true
    },
    {
      name: 'CAC',
      value: 'submittedCAC',
      width: '10%',
      nosort: true
    }
  ];

  public tableParams: TableParamsObject = new TableParamsObject();
  public commentPeriodId: string;
  public baseRouteUrl: string;

  ngOnInit() {
    if (this.storageService.state.commentReviewTabParams == null) {
      this.route.params
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(params => {
          this.commentPeriodId = params.commentPeriodId;
          this.filter.pending = params.pending == null || params.pending === 'false' ? false : true;
          this.filter.published = params.published == null || params.published === 'false' ? false : true;
          this.filter.deferred = params.deferred == null || params.deferred === 'false' ? false : true;
          this.filter.rejected = params.rejected == null || params.rejected === 'false' ? false : true;
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, this.filter);
        });
    } else {
      this.commentPeriodId = this.storageService.state.commentReviewTabParams.commentPeriodId;
      this.filter = this.storageService.state.commentReviewTabParams.filter;
      this.tableParams = this.storageService.state.commentReviewTabParams.tableParams;
      this.storageService.state.commentReviewTabParams = null;
    }
    this.tableParams.sortBy = sortOrDefault(this.tableParams.sortBy);

    this.baseRouteUrl = (this.storageService.state.currentProject?.type ?? 'currentProject') === 'currentProject' ? '/p' : '/pn';
    this.storageService.state.selectedTab = 0;

    this.loadComments()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(({ rows, total }) => {
          this.tableParams.totalListItems = total ?? 0;
          this.comments = rows;
          this.setCommentRowData();
          // A period with a published comment cannot be deleted.
          this.storageService.state.canDeleteCommentPeriod = {
            type: 'canDeleteCommentPeriod', data: !rows.some(comment => comment.eaoStatus === 'Published')
          };
          this.storageService.state.commentReviewTabParams = { tableParams: this.tableParams, filter: this.filter, commentPeriodId: this.commentPeriodId };
          this.loading = false;
          this.cdr.markForCheck();
        });
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
          _id: comment.id,
          // Safety check if documents are null or are present with an emtpy array
          attachments: comment.documents !== null ? comment.documents.length : 0,
          commentId: comment.commentId,
          author: comment.author,
          comment: comment.comment,
          dateAdded: comment.dateAdded,
          eaoStatus: comment.eaoStatus,
          location: comment.location,
          period: comment.periodId,
          submittedCAC: comment.submittedCAC
        }
      );
    });
    this.commentTableData = new TableObject(
      ReviewCommentsTabTableRowsComponent,
      commentList,
      this.tableParams,
      { baseRouteUrl: this.baseRouteUrl, projectId: this.project()._id ?? this.project().data?._id }
    );
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.getPaginatedComments(1);
  }

  getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.loadComments()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(({ rows, total }) => {
          this.tableParams.totalListItems = total ?? 0;
          this.comments = rows;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filter);
          this.setCommentRowData();

          this.storageService.state.commentReviewTabParams = { tableParams: this.tableParams, filter: this.filter, commentPeriodId: this.commentPeriodId };
          this.loading = false;
          this.cdr.markForCheck();
        });
  }

  /** The current page, filtered to the toggled statuses; none toggled shows every status. */
  private loadComments() {
    return this.commentService.listByPeriod(this.commentPeriodId, {
      page: this.tableParams.currentPage,
      pageSize: this.tableParams.pageSize,
      sort: this.tableParams.sortBy.replace(/^\+/, ''),
      eaoStatus: Object.keys(STATUS_FILTERS).filter(key => this.filter[key]).map(key => STATUS_FILTERS[key])
    });
  }
}

/** DEMI sorts comments by `dateAdded` only; any other saved sort falls back to newest first. */
function sortOrDefault(sortBy: string): string {
  return /^[+-]?dateAdded$/.test(sortBy) ? sortBy : DEFAULT_SORT;
}
