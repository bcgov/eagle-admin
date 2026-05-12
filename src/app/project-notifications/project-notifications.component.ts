import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ProjectNotificationTableRowsComponent } from './project-notifications-table-rows/project-notifications-table-rows.component';
import { ProjectNotification } from '../models/projectNotification';
import { SearchTerms } from '../models/search';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { SearchService } from '../services/search.service';
import { LoadingStateService } from '../services/loading-state.service';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';
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
  private searchService = inject(SearchService);
  public loadingState = inject(LoadingStateService);
  public loading = this.loadingState.getOperationState('search-results');

  public terms = new SearchTerms();
  public notificationProjects: ProjectNotification[] = null;

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
      value: 'notificationDecision',
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
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '-_id';
          }

          const pageNum = this.tableParams.currentPage || 1;
          const pageSize = this.tableParams.pageSize || 10;
          const sortBy = this.tableParams.sortBy || '-_id';
          const keywords = this.tableParams.keywords || '';

          return this.searchService.getSearchResults(
            keywords, 'ProjectNotification', null,
            pageNum, pageSize, sortBy, {}
          );
        })
      ).subscribe((res: any) => {
        if (res && res[0].data.meta && res[0].data.meta.length > 0) {
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
          this.notificationProjects = res[0].data.searchResults;
        } else {
          this.tableParams.totalListItems = 0;
          this.notificationProjects = [];
        }
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
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  addNP() {
    this.router.navigate(['project-notifications', 'add']);
  }

}
