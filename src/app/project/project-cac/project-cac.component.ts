import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { StorageService } from 'app/services/storage.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router, ActivatedRoute } from '@angular/router';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Subject } from 'rxjs';
import { SearchTerms, ISearchResults } from 'app/models/search';
import { CACTableRowsComponent } from 'app/project/project-cac/cac-table-rows/cac-table-rows.component';
import { Utils } from 'app/shared/utils/utils';
import { Project } from 'app/models/project';

@Component({
  selector: 'app-project-cac',
  templateUrl: './project-cac.component.html',
  styleUrls: ['./project-cac.component.scss']
})
export class ProjectCACComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  public currentProject;
  public loading = true;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public keywords;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public cacMembers;
  public tableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Email',
      value: 'email',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Comment',
      value: 'comment',
      width: 'col-10',
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
    // this.route.parent.data
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     (data: { project: ISearchResults<Project>[] }) => {
    //       if (data.project) {
    //         console.log("F:", data.project);
    //       }
    //     });

    this.currentProject = this.storageService.state.currentProject.data;

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        this.tableParams.sortBy = '-email';
      });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        if (data) {
          if (data.cacMembers && data.cacMembers[0].data.meta && data.cacMembers[0].data.meta.length > 0) {
            this.tableParams.totalListItems = data.cacMembers[0].data.meta[0].searchResultsTotal;
            this.cacMembers = data.cacMembers[0].data.searchResults;
          } else {
            this.tableParams.totalListItems = 0;
            this.cacMembers = [];
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
    if (this.cacMembers && this.cacMembers.length > 0) {
      this.cacMembers.forEach(item => {
        list.push(
          item
        );
      });
      this.tableData = new TableObject(
        CACTableRowsComponent,
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
    params['sortBy'] = this.tableParams.sortBy = '-email';
    params['keywords'] = this.utils.encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-cac', params]);
  }

  getPaginatedDocs(pageNumber) {
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy = '-email';
    params['keywords'] = this.utils.encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-cac', params]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
