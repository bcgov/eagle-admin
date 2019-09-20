import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { Compliance } from 'app/models/compliance';
import { SearchTerms } from 'app/models/search';

import { StorageService } from 'app/services/storage.service';

import { ComplianceTableRowsComponent } from './compliance-table-rows/compliance-table-rows.component';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss']
})
export class ComplianceComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public compliances: Compliance[] = null;
  public loading = true;

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: 'Inspection #',
      value: 'name',
      width: 'col-2'
    },
    {
      name: 'Inspector',
      value: 'email',
      width: 'col-3'
    },
    {
      name: 'Start Date',
      value: 'startDate',
      width: 'col-2'
    },
    {
      name: 'End Date',
      value: 'endDate',
      width: 'col-2'
    },
    {
      name: 'Actions',
      value: 'actions',
      width: 'col-3',
      nosort: true
    }
  ];

  public selectedCount = 0;

  public currentProject;
  public canPublish;
  public canUnpublish;

  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
      });
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          if (res.compliances[0].data.meta && res.compliances[0].data.meta.length > 0) {
            this.tableParams.totalListItems = res.compliances[0].data.meta[0].searchResultsTotal;
            this.compliances = res.compliances[0].data.searchResults;
          } else {
            this.tableParams.totalListItems = 0;
            this.compliances = [];
          }
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load compliance');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, { verticalPosition: 'top', horizontalPosition: 'center', duration: 4000 });
  }

  navSearchHelp() {
    this.router.navigate(['/search-help']);
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;

    const encode = encodeURIComponent;
    window['encodeURIComponent'] = (component: string) => {
      return encode(component).replace(/[!'()*]/g, (c) => {
        // Also encode !, ', (, ), and *
        return '%' + c.charCodeAt(0).toString(16);
      });
    };

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = currentPage;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = encode(this.tableParams.keywords = this.tableParams.keywords || '').replace(/\(/g, '%28').replace(/\)/g, '%29');
    params['sortBy'] = this.tableParams.sortBy;

    this.router.navigate(['p', this.currentProject._id, 'compliance', params]);
  }

  setRowData() {
    let documentList = [];
    if (this.compliances && this.compliances.length > 0) {
      this.compliances.forEach(item => {
        documentList.push(
          {
            _id: item._id,
            name: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
            project: item.project,
            email: item.email,
            case: item.case,
            label: item.label,
            elements: item.elements
          }
        );
      });
      this.documentTableData = new TableObject(
        ComplianceTableRowsComponent,
        documentList,
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

  isEnabled(button) {
    switch (button) {
      default:
        return this.selectedCount > 0;
        break;
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
