import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, inject, signal, computed, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LegacyCommentPeriod, toLegacyCommentPeriod } from './comment-period-legacy';
import { CommentPeriodService } from '../services/commentperiod.service';
import { StorageService } from '../services/storage.service';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { TableTemplateUtils, nextSortBy } from '../shared/utils/table-template-utils';
import { CommentPeriodsTableRowsComponent } from './comment-periods-table-rows/comment-periods-table-rows.component';

import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';
import { LoadingStateService } from '../services/loading-state.service';
import { DemiCommentPeriod } from '../models/demi/comment-period';
import { DemiList } from '../models/demi/demi-list';

const SORT_FIELDS = ['dateStarted', 'dateCompleted'];
const DEFAULT_SORT = '-dateStarted';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-comment-periods',
  templateUrl: './comment-periods.component.html',
  styleUrl: './comment-periods.component.css',
  imports: [
    RouterModule,
    TableTemplateComponent
  ]
})
export class CommentPeriodsComponent implements OnInit {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private commentPeriodService = inject(CommentPeriodService);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private destroyRef = inject(DestroyRef);

  public commentPeriods: LegacyCommentPeriod[] = null;
  public commentPeriodTableColumns: TableColumn[] = [
    {
      name: 'Status',
      value: 'commentPeriodStatus',
      width: '10%',
      // Status comes from both dates vs now; no single stored field orders it.
      nosort: true
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
      width: '15%',
      // Same order as End Date, so one sortable column is enough.
      nosort: true
    },
    {
      name: 'Published',
      value: 'isPublished',
      width: '15%',
      // DEMI sorts comment periods on dateStarted and dateCompleted only.
      nosort: true
    },
    {
      name: 'Comment Data',
      value: 'commentData',
      width: '30%',
      nosort: true
    }
  ];

  public commentPeriodTableData: TableObject;
  public loadingState = inject(LoadingStateService);
  /** DEMI project id, or the notification id for a notification's periods. */
  private currentProjId = signal<string | null>(null);
  public loading = computed(() => {
    const projId = this.currentProjId();
    if (!projId) return false;
    return this.loadingState.isOperationLoading('comment-periods-native-' + projId);
  });
  public currentProject;
  public baseRouteUrl: string;

  public tableParams: TableParamsObject = new TableParamsObject();

  ngOnInit() {
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;
    this.storageService.state.currentCommentPeriod = null;

    this.currentProject = this.storageService.state.currentProject;
    this.baseRouteUrl = this.currentProject.type === 'currentProject' ? '/p' : '/pn';
    this.storageService.state.commentReviewTabParams = null;

    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        if (!SORT_FIELDS.includes(this.tableParams.sortBy?.replace(/^[-+]/, ''))) {
          this.tableParams.sortBy = DEFAULT_SORT;
        }
        this.currentProjId.set(this.parentId());
        return this.listPeriods();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(page => this.showPage(page));
    this.storageService.state.selectedTab = 0;
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.getPaginatedComments(1);
  }

  setCPRowData() {
    const cpList = [];
    this.commentPeriods.forEach(commentPeriod => {
      cpList.push(
        {
          commentPeriodStatus: commentPeriod.commentPeriodStatus,
          dateStarted: commentPeriod.dateStarted,
          dateCompleted: commentPeriod.dateCompleted,
          daysRemaining: commentPeriod.daysRemaining,
          isMet: commentPeriod.isMet,
          metURLAdmin: commentPeriod.metURLAdmin,
          read: commentPeriod.isPublished ? 'Published' : 'Not Published',
          _id: commentPeriod._id,
          demiId: commentPeriod.demiId,
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

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.listPeriods()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(page => {
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.showPage(page);
      });
  }

  /** Periods store the DEMI project id; a notification's periods store the notification id, which is its route id. */
  private parentId(): string | null {
    const parent = this.route.parent.snapshot;
    return parent.paramMap.get('notificationProjectId') ?? parent.data?.['project']?.demiId ?? null;
  }

  private listPeriods(): Observable<DemiList<DemiCommentPeriod>> {
    const projectId = this.currentProjId();
    if (!projectId) {
      return of({ rows: [], total: 0 });
    }
    return this.commentPeriodService.listByProject(projectId, {
      page: this.tableParams.currentPage || 1,
      pageSize: this.tableParams.pageSize || 10,
      // A leading `+` would reach DEMI as a space.
      sort: this.tableParams.sortBy.replace(/^\+/, '')
    });
  }

  private showPage(page: DemiList<DemiCommentPeriod>) {
    this.commentPeriods = page.rows.map(row => toLegacyCommentPeriod(row));
    this.tableParams.totalListItems = page.total ?? this.commentPeriods.length;
    this.setCPRowData();
    this._changeDetectionRef.markForCheck();
  }

}

