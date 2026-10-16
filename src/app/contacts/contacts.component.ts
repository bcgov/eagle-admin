import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserTableRowsComponent } from './user-table-rows/user-table-rows.component';
import { SearchTerms } from '../models/search';
import { User, USER_SORT_KEYS } from '../models/demi/user';
import { StorageService } from '../services/storage.service';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { NavigationStackUtils } from '../shared/utils/navigation-stack-utils';
import { TableTemplateUtils, nextSortBy, nativeSort, tableSort } from '../shared/utils/table-template-utils';
import { UserService, emptyPageOnError } from '../services/user.service';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';
import { LoadingStateService } from '../services/loading-state.service';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css',
  imports: [
    RouterModule,
    FormsModule,
    TableTemplateComponent
]
})
export class ContactsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private navigationStackUtils = inject(NavigationStackUtils);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private storageService = inject(StorageService);
  private userService = inject(UserService);
  private logger = inject(LoggingService);
  private toastService = inject(ToastService);

  private destroyRef = inject(DestroyRef);

  public terms = new SearchTerms();
  public users: User[] = null;
  public loadingState = inject(LoadingStateService);
  public loading = this.loadingState.getOperationState('search-results');

  public documentTableData: TableObject;
  public documentTableColumns: TableColumn[] = [
    {
      name: 'Name',
      value: 'displayName',
      width: '25%'
    },
    {
      name: 'Organization',
      value: 'orgName',
      width: '25%'
    },
    {
      name: 'Phone',
      value: 'phoneNumber',
      width: '15%'
    },
    {
      name: 'Email',
      value: 'email',
      width: '25%'
    },
    {
      name: 'Action',
      value: 'null',
      width: '10%',
      nosort: true
    }
  ];

  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        const sort = nativeSort(this.tableParams.sortBy, 'displayName', USER_SORT_KEYS);
        if (this.tableParams.sortBy !== tableSort(sort)) {
          this.tableParams.sortBy = tableSort(sort);
          this.tableTemplateUtils.updateUrl(
            this.tableParams.sortBy,
            this.tableParams.currentPage,
            this.tableParams.pageSize,
            undefined,
            this.tableParams.keywords
          );
        }
        return this.userService.listUsers({
          q: this.tableParams.keywords,
          page: this.tableParams.currentPage,
          pageSize: this.tableParams.pageSize,
          sort
        }).pipe(emptyPageOnError<User>(err => {
          this.logger.error('contact list failed', 'ContactsComponent', err);
          this.toastService.error('Contacts could not be loaded.');
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ rows, total }) => {
      this.tableParams.totalListItems = total ?? 0;
      this.users = rows;
      this.setDocumentRowData();
      this._changeDetectionRef.markForCheck();
    });
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = currentPage;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    params['sortBy'] = this.tableParams.sortBy;

    this.router.navigate(['contacts', params]);
  }

  setDocumentRowData() {
    this.documentTableData = new TableObject(
      UserTableRowsComponent,
      [...(this.users ?? [])],
      this.tableParams
    );
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.onSubmit(1);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  addContact() {
    this.storageService.state.contactForm = null;
    this.storageService.state.selectedOrganization = null;
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['contacts', 'add']);
  }

}
