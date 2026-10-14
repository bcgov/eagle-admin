import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchTerms } from 'src/app/models/search';
import { User, nativeSort, tableSort } from 'src/app/models/demi/user';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils, nextSortBy } from 'src/app/shared/utils/table-template-utils';
import { UserService, emptyPageOnError } from 'src/app/services/user.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-group-contact-select',
  imports: [
    FormsModule,
    RouterModule,
    TableTemplateComponent
  ],
  templateUrl: './group-contact-select.component.html',
  styleUrl: './group-contact-select.component.css',

})
export class GroupContactSelectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  navigationStackUtils = inject(NavigationStackUtils);
  private tableTemplateUtils = inject(TableTemplateUtils);
  storageService = inject(StorageService);
  private userService = inject(UserService);
  private logger = inject(LoggingService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  public navigationObject;

  public currentProject;
  public loading = true;
  public entries: User[] = null;
  public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: TableColumn[];

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    // DEMI sorts contacts by name only.
    this.tableColumns = this.storageService.state.tableColumns?.map((column: TableColumn) =>
      column.value === 'displayName' ? column : { ...column, nosort: true });

    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    } else {
      // redir to project details.
      return this.router.navigate(['/p', this.currentProject._id]);
    }

    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
        // The members screen may hand over a client-side sort (email, organization); DEMI sorts by name only.
        const sort = nativeSort(this.tableParams.sortBy || this.storageService.state.sortBy, 'displayName');
        if (this.tableParams.sortBy !== tableSort(sort)) {
          this.tableParams.sortBy = tableSort(sort);
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        this._changeDetectionRef.markForCheck();
        return this.userService.listUsers({
          q: this.tableParams.keywords,
          page: this.tableParams.currentPage,
          pageSize: this.tableParams.pageSize,
          sort
        }).pipe(emptyPageOnError<User>(err => {
          this.logger.error('contact list failed', 'GroupContactSelectComponent', err);
          this.toastService.error('Contacts could not be loaded.');
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ rows, total }) => {
      this.tableParams.totalListItems = total ?? 0;
      this.entries = rows;
      this.setRowData();
      this.loading = false;
      this._changeDetectionRef.markForCheck();
    });
  }

  setRowData() {
    const chosen = new Set((this.storageService.state.selectedUsers as User[]).map(user => user.id));
    const list = (this.entries ?? []).map(item => {
      item.checkbox = chosen.has(item.id);
      return item;
    });
    this.tableData = new TableObject(
      this.storageService.state.rowComponent,
      list,
      this.tableParams
    );
  }

  goBack() {
    const backUrl = this.navigationStackUtils.getLastBackUrl();
    if (backUrl === null) {
      this.router.navigate(['/p', this.currentProject._id, 'project-groups']);
    } else {
      this.navigationStackUtils.popNavigationStack();
      this.router.navigate(backUrl);
    }
  }

  save() {
    // Add these records to the group list.
    const items = [];
    this.storageService.state.selectedUsers.map((item) => {
      items.push(item);
    });

    this.storageService.state.update(items, this.storageService.state.component);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'selectAll':
        let someSelected = false;
        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
        });
        this.tableData.data.map((item) => {
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.tableData.data.length;
        this._changeDetectionRef.markForCheck();
        break;
      case 'createContact':
        this.storageService.state.contactForm = null;
        this.storageService.state.selectedOrganization = null;

        const nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
        nextBreadcrumbs.push(
          {
            route: ['/p', this.currentProject._id, 'project-groups', 'g', this.storageService.state.groupId, 'members', 'select'],
            label: 'Select Contact(s)'
          }
        );
        this.navigationStackUtils.pushNavigationStack(
          ['/p', this.currentProject._id, 'project-groups', 'g', this.storageService.state.groupId, 'members', 'select'],
          nextBreadcrumbs
        );
        this.router.navigate(['/contacts', 'add']);
    }
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.getPaginatedDocs(1);
  }

  getPaginatedDocs(pageNumber, reset = false) {
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;
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
    arr.push('select');
    arr.push(params);
    this.router.navigate(arr);
  }

  removeSelectedUser(user) {
    this.storageService.state.selectedUsers = this.storageService.state.selectedUsers.filter(function (element) {
      return element.id !== user.id;
    });
    this.tableData.data.map(item => {
      if (user.id === item.id) {
        item.checkbox = false;
      }
    });
    this._changeDetectionRef.markForCheck();
  }

}