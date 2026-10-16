import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ProjectNotificationTableRowsComponent } from './project-notifications-table-rows/project-notifications-table-rows.component';
import { LegacyNotification, legacyNotification, notificationSort } from '../models/demi/notification';
import { SearchTerms } from '../models/search';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { NOTIFICATION_LIST_LOADING, NotificationProjectService } from '../services/notification-project.service';
import { LoadingStateService } from '../services/loading-state.service';
import { TableTemplateUtils, nextSortBy } from '../shared/utils/table-template-utils';
import { FormsModule } from '@angular/forms';

import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notification-projects',
  imports: [
    FormsModule,
    TableTemplateComponent,
    RouterModule
  ],
  templateUrl: './project-notifications.component.html',
  styleUrl: './project-notifications.component.css',

})
export class ProjectNotificationsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private notificationService = inject(NotificationProjectService);
  public loadingState = inject(LoadingStateService);
  public loading = this.loadingState.getOperationState(NOTIFICATION_LIST_LOADING);

  public terms = new SearchTerms();
  public notificationProjects: LegacyNotification[] = null;

  public documentTableData: TableObject;
  public documentTableColumns: TableColumn[] = [
    {
      name: 'Name',
      value: 'name',
      width: '40%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '15%'
    },
    {
      name: 'Sub Type',
      value: 'subType',
      width: '15%'
    },
    {
      name: 'Region',
      value: 'region',
      width: '15%'
    },
    {
      name: 'Decision',
      value: 'decision',
      width: '15%'
    }
  ];

  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
          // Unset sort = DEMI default: newest notification first, or keyword rank.
          return this.notificationService.listNative({
            page: this.tableParams.currentPage || 1,
            pageSize: this.tableParams.pageSize || 10,
            count: true,
            sort: notificationSort(this.tableParams.sortBy),
            q: this.tableParams.keywords || undefined
          });
        })
      ).subscribe(res => {
        this.tableParams.totalListItems = res.total ?? 0;
        this.notificationProjects = res.rows.map(legacyNotification);
        this.setRowData();
      });
  }

  public onSubmit(currentPage = 1) {

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = currentPage;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    params['sortBy'] = this.tableParams.sortBy;

    this.router.navigate(['project-notifications', params]);
  }

  setRowData() {
    if (this.notificationProjects && this.notificationProjects.length > 0) {
      const list = [...this.notificationProjects];
      this.documentTableData = new TableObject(
        ProjectNotificationTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.onSubmit(1);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  addNP() {
    this.router.navigate(['project-notifications', 'add']);
  }

}
