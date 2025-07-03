import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivityDetailTableRowsComponent } from 'src/app/activity/activity-detail-table-rows/activity-detail-table-rows.component';
import { SearchTerms } from 'src/app/models/search';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { Utils } from 'src/app/shared/utils/utils';

import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';

@Component({
  selector: 'app-project-updates',
  templateUrl: './project-updates.component.html',
  styleUrls: ['./project-updates.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    TableTemplateComponent
]
})
export class ProjectUpdatesComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  public terms = new SearchTerms();
  public currentProject;
  public loading = true;
  public keywords;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public recentActivities;
  public tableColumns: any[] = [
    {
      name: 'Headline',
      value: 'headine',
      width: '80%',
      nosort: true
    },
    {
      name: 'Date',
      value: 'dateUpdated',
      width: '20%',
      nosort: true
    }
  ];

  constructor(
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef,
    private utils: Utils
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.subscriptions.add(
      this.route.params
        .subscribe(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
          this.tableParams.sortBy = '-dateUpdated';
        })
    );

    this.subscriptions.add(
      this.route.data
        .subscribe((data: any) => {
          if (data) {
            if (data.documents && data.documents[0].data.meta && data.documents[0].data.meta.length > 0) {
              this.tableParams.totalListItems = data.documents[0].data.meta[0].searchResultsTotal;
              this.recentActivities = data.documents[0].data.searchResults;
            } else {
              this.tableParams.totalListItems = 0;
              this.recentActivities = [];
            }
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load valued components');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        })
    );
  }

  setRowData() {
    const list = [];
    if (this.recentActivities && this.recentActivities.length > 0) {
      this.recentActivities.forEach(document => {
        list.push(
          document
        );
      });
      this.tableData = new TableObject(
        ActivityDetailTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '-datePosted';
    params['keywords'] = this.utils.encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

  getPaginatedDocs(pageNumber) {
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy = '-datePosted';
    params['keywords'] = this.utils.encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
