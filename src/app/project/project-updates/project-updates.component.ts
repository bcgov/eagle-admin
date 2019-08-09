import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { StorageService } from 'app/services/storage.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router, ActivatedRoute } from '@angular/router';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Subject } from 'rxjs';
import { SearchTerms } from 'app/models/search';
import { ActivityDetailTableRowsComponent } from 'app/activity/activity-detail-table-rows/activity-detail-table-rows.component';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-project-updates',
  templateUrl: './project-updates.component.html',
  styleUrls: ['./project-updates.component.scss']
})
export class ProjectUpdatesComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  public currentProject;
  public loading = true;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public keywords;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public recentActivities;
  public tableColumns: any[] = [
    {
      name: 'Headline',
      value: 'headine',
      width: 'col-10',
      nosort: true
    },
    {
      name: 'Date',
      value: 'dateUpdated',
      width: 'col-2',
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

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        this.tableParams.sortBy = '-dateUpdated';
      });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
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
      });
  }

  setRowData() {
    let list = [];
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
    params['keywords'] = this.utils.encode(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

  getPaginatedDocs(pageNumber) {
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy = '-datePosted';
    params['keywords'] = this.utils.encode(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
