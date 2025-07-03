import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectNotificationTableRowsComponent } from './project-notifications-table-rows/project-notifications-table-rows.component';
import { ProjectNotification } from '../models/projectNotification';
import { SearchTerms } from '../models/search';
import { TableObject } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableTemplateComponent,
    RouterModule
  ],
  templateUrl: './project-notifications.component.html',
  styleUrls: ['./project-notifications.component.css'],

})
export class ProjectNotificationsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private tableTemplateUtils = inject(TableTemplateUtils);

  private subscriptions = new Subscription();

  public terms = new SearchTerms();
  public notificationProjects: ProjectNotification[] = null;
  public loading = true;

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
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
    this.subscriptions.add(
      this.route.params
        .subscribe(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
          // default sort order
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '-_id';
          }
          this.subscriptions.add(
            this.route.data
              .subscribe((res: any) => {
                if (res && res.notificationProjects && res.notificationProjects[0].data.meta && res.notificationProjects[0].data.meta.length > 0) {
                  this.tableParams.totalListItems = res.notificationProjects[0].data.meta[0].searchResultsTotal;
                  this.notificationProjects = res.notificationProjects[0].data.searchResults;
                } else {
                  this.tableParams.totalListItems = 0;
                  this.notificationProjects = [];
                }
                this.setRowData();
                this.loading = false;
                this._changeDetectionRef.detectChanges();
              })
          );
        })
    );
  }

  public onSubmit(currentPage = 1) {
    this.loading = true;

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
