import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivityDetailTableRowsComponent } from 'src/app/activity/activity-detail-table-rows/activity-detail-table-rows.component';
import { SearchTerms } from 'src/app/models/search';
import { StorageService } from 'src/app/services/storage.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { DemiList } from 'src/app/models/demi/demi-list';
import { DemiUpdate, nativeUpdateSort } from 'src/app/models/demi/update';

import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-project-updates',
  templateUrl: './project-updates.component.html',
  styleUrl: './project-updates.component.css',
  imports: [
    FormsModule,
    RouterModule,
    TableTemplateComponent
  ]
})
export class ProjectUpdatesComponent implements OnInit {
  private storageService = inject(StorageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private recentActivityService = inject(RecentActivityService);
  private loadingState = inject(LoadingStateService);
  private destroyRef = inject(DestroyRef);

  public terms = new SearchTerms();
  public currentProject;
  public loading = this.loadingState.getOperationState('search-results');
  public keywords;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public recentActivities: DemiUpdate[] = [];
  public tableColumns: TableColumn[] = [
    {
      name: 'Headline',
      value: 'headline',
      width: '80%',
      nosort: true
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: '20%'
    }
  ];

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '-dateAdded';
        }

        // Updates store the Eagle project id; a project with none has no updates.
        const eagleProjectId = this.route.parent.snapshot.data['project']?._id;
        if (!eagleProjectId) {
          return of({ rows: [], total: 0 } as DemiList<DemiUpdate>);
        }
        return this.recentActivityService.list({
          page: this.tableParams.currentPage,
          pageSize: this.tableParams.pageSize,
          sort: nativeUpdateSort(this.tableParams.sortBy) ?? '-dateAdded',
          q: this.tableParams.keywords || undefined,
          filters: { project: eagleProjectId }
        }).pipe(withLoading(this.loadingState, 'search-results'));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: page => {
        this.tableParams.totalListItems = page.total ?? 0;
        this.recentActivities = page.rows;
        this.setRowData();
        this._changeDetectionRef.markForCheck();
      },
      error: () => this.router.navigate(['/search'])
    });
  }

  setRowData() {
    if (this.recentActivities?.length) {
      this.tableData = new TableObject(ActivityDetailTableRowsComponent, this.recentActivities, this.tableParams);
    }
  }

  setColumnSort(column: string) {
    this.tableParams.sortBy = (this.tableParams.sortBy === '+' + column ? '-' : '+') + column;
    this.onSubmit();
  }

  public onSubmit(pageNumber = 1) {
    // Router ignores navigation to the same URL; the timestamp forces a reload.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = this.tableParams.keywords = this.keywords || '';
    params['pageSize'] = this.tableParams.pageSize;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

}
