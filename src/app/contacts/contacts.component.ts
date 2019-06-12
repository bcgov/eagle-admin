import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { User } from 'app/models/user';
import { SearchService } from 'app/services/search.service';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { UserTableRowsComponent } from './user-table-rows/user-table-rows.component';
import { SearchTerms } from 'app/models/search';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public users: User[] = null;
  public loading = true;

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-3'
    },
    {
      name: 'Organization',
      value: 'org',
      width: 'col-4'
    },
    {
      name: 'Phone',
      value: 'phoneNumber',
      width: 'col-3'
    },
    {
      name: 'Email',
      value: 'email',
      width: 'col-3'
    }
  ];

  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res && res.users && res.users[0].data.meta && res.users[0].data.meta.length > 0) {
          this.tableParams.totalListItems = res.users[0].data.meta[0].searchResultsTotal;
          this.users = res.users[0].data.searchResults;
        } else {
          this.tableParams.totalListItems = 0;
          this.users = [];
        }
        this.setDocumentRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      }
      );
  }

  public checkChange(event) {
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '';

    this.router.navigate(['u', params]);
  }

  setDocumentRowData() {
    if (this.users && this.users.length > 0) {
      const list = [...this.users];
      this.documentTableData = new TableObject(
        UserTableRowsComponent,
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
    this.getPaginatedContacts(this.tableParams.currentPage);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  getPaginatedContacts(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.searchService.getSearchResults(null,
      'User',
      null,
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      null)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.users = res[0].data.searchResults;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, null || '');
        this.setDocumentRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
