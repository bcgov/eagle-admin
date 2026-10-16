import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableParamsObject } from '../table-template/table-params-object';
import { TableObject, TableColumn } from '../table-template/table-object';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchTerms } from 'src/app/models/search';
import { User } from 'src/app/models/user';
import { User as DemiUser, USER_SORT_KEYS } from 'src/app/models/demi/user';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { TableTemplateUtils, nextSortBy, nativeSort, tableSort } from '../../utils/table-template-utils';
import { UserService, emptyPageOnError } from 'src/app/services/user.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from '../table-template/table-template.component';

/** Legacy row for the project form tabs, which store the picked contact's `_id` and `displayName`. */
export function toPickedContact(row: DemiUser): User {
  return new User({
    _id: row.id,
    displayName: row.displayName,
    orgName: row.orgName,
    email: row.email,
    phoneNumber: row.phoneNumber
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contact-select',
  templateUrl: './contact-select.component.html',
  styleUrl: './contact-select.component.css',
  imports: [
    FormsModule,
    RouterModule,
    TableTemplateComponent
  ]
})
export class ContactSelectComponent implements OnInit {
  navigationStackUtils = inject(NavigationStackUtils);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private tableTemplateUtils = inject(TableTemplateUtils);
  storageService = inject(StorageService);
  private userService = inject(UserService);
  private logger = inject(LoggingService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private loadingState = inject(LoadingStateService);

  public loading = this.loadingState.getOperationState('search-results');
  public entries: DemiUser[] = null;
  public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;
  public navigationObject;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: TableColumn[] = [
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
      name: 'Email',
      value: 'email',
      width: '25%'
    },
    {
      name: 'Phone Number',
      value: 'phoneNumber',
      width: '25%'
    }
  ];

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    } else {
      // TODO: determine where to boot out.
      this.router.navigate(['/']);
    }

    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
        const sort = nativeSort(this.tableParams.sortBy || this.storageService.state.sortBy, 'displayName', USER_SORT_KEYS);
        if (this.tableParams.sortBy !== tableSort(sort)) {
          this.tableParams.sortBy = tableSort(sort);
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        return this.userService.listUsers({
          q: this.tableParams.keywords,
          page: this.tableParams.currentPage,
          pageSize: this.tableParams.pageSize,
          sort
        }).pipe(emptyPageOnError<DemiUser>(err => {
          this.logger.error('contact list failed', 'ContactSelectComponent', err);
          this.toastService.error('Contacts could not be loaded.');
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ rows, total }) => {
      this.tableParams.totalListItems = total ?? 0;
      this.entries = rows;
      this.setRowData();
      this._changeDetectionRef.markForCheck();
    });
  }

  setRowData() {
    this.tableData = new TableObject(
      this.storageService.state.rowComponent,
      (this.entries ?? []).map(toPickedContact),
      this.tableParams
    );
  }

  goBack() {
    const url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.getPaginatedDocs(1);
  }

  getPaginatedDocs(pageNumber, reset = false) {
    this._changeDetectionRef.markForCheck();

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;

    if (reset) {
      this.tableParams.sortBy = '';
      this.tableParams.pageSize = 25;
      this.tableParams.keywords = '';
      this.typeFilters = [];
    }

    params['sortBy'] = this.tableParams.sortBy;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    if (this.typeFilters.length > 0) { params['type'] = this.typeFilters.toString(); }

    const arr = [...this.navigationObject.backUrl];
    arr.push('link-contact');
    arr.push(params);
    this.router.navigate(arr);
  }

  createContact() {
    this.storageService.state.contactForm = null;
    this.storageService.state.selectedOrganization = null;

    const nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
    const nextRoute = [...this.navigationObject.breadcrumbs[this.navigationObject.breadcrumbs.length - 1].route];
    nextRoute.push('link-contact');
    nextRoute.push({ 'pageSize': 25 });
    nextBreadcrumbs.push(
      {
        route: nextRoute,
        label: 'Select Contact'
      }
    );
    this.navigationStackUtils.pushNavigationStack(
      nextRoute,
      nextBreadcrumbs
    );
    this.router.navigate(['/contacts', 'add']);
  }

}
