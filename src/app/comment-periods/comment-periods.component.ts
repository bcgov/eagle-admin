import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, inject, signal, computed, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentPeriod } from '../models/commentPeriod';
import { CommentPeriodService } from '../services/commentperiod.service';
import { ConfigService } from '../services/config.service';
import { StorageService } from '../services/storage.service';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';
import { CommentPeriodsTableRowsComponent } from './comment-periods-table-rows/comment-periods-table-rows.component';

import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';
import { LoadingStateService } from '../services/loading-state.service';

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
  private configService = inject(ConfigService);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private commentPeriodService = inject(CommentPeriodService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private destroyRef = inject(DestroyRef);

  public commentPeriods: CommentPeriod[] = null;
  public commentPeriodTableColumns: TableColumn[] = [
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
  public loadingState = inject(LoadingStateService);
  private currentProjId = signal<string | null>(null);
  public loading = computed(() => {
    const projId = this.currentProjId();
    if (!projId) return false;
    return this.loadingState.isOperationLoading('comment-periods-' + projId);
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
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '-dateStarted';
        }

        const projectId = this.route.parent.snapshot.paramMap.get('projId')
          || this.route.parent.snapshot.paramMap.get('notificationProjectId');
        this.currentProjId.set(projectId);
        const pageNum = this.tableParams.currentPage || 1;
        const pageSize = this.tableParams.pageSize || 10;
        const sortBy = this.tableParams.sortBy || '-dateStarted';

        return this.commentPeriodService.getAllByProjectId(projectId, pageNum, pageSize, sortBy);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: any) => {
      if (res) {
        this.tableParams.totalListItems = res.totalCount;
        this.commentPeriods = res.totalCount > 0 ? res.data : [];
      } else {
        this.tableParams.totalListItems = 0;
        this.commentPeriods = [];
      }
      this.setCPRowData();
      this._changeDetectionRef.markForCheck();
    });
    this.storageService.state.selectedTab = 0;
  }

  setColumnSort(column) {
    this.tableParams.sortBy = (this.tableParams.sortBy.startsWith('+') ? '-' : '+') + column;
    this.getPaginatedComments(this.tableParams.currentPage);
  }

  setCPRowData() {
    const cpList = [];
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

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.commentPeriodService.getAllByProjectId(this.currentProject.data._id, pageNumber, this.tableParams.pageSize, this.tableParams.sortBy)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.commentPeriods = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setCPRowData();
        this._changeDetectionRef.markForCheck();
      });
  }

  public addCommentPeriod() {
    this.storageService.state.currentProject = this.currentProject;

    if (this.currentProject.data.hasMetCommentPeriods) {
      let metURL;
      switch (this.configService.config().ENVIRONMENT || 'local') {
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

}
