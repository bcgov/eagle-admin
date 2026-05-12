import { Component, OnInit, OnDestroy, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LinkOrganizationTableRowsComponent } from './link-organization-table-rows/link-organization-table-rows.component';
import { Org } from 'src/app/models/org';
import { SearchTerms } from 'src/app/models/search';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { TableTemplateUtils } from '../../utils/table-template-utils';
import { TableObject, TableColumn } from '../table-template/table-object';
import { TableParamsObject } from '../table-template/table-params-object';
import { TableTemplateComponent } from '../table-template/table-template.component';
import { LoggingService } from 'src/app/services/logging.service';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { SearchService } from 'src/app/services/search.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-link-organization',
  templateUrl: './link-organization.component.html',
  styleUrl: './link-organization.component.css',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableTemplateComponent
  ]
})
export class LinkOrganizationComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storageService = inject(StorageService);
  protected navigationStackUtils = inject(NavigationStackUtils);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private logger = inject(LoggingService);
  private searchService = inject(SearchService);
  private loadingState = inject(LoadingStateService);

  public terms = new SearchTerms();
  public organizations: Org[] = null;
  public loading = this.loadingState.getOperationState('search-results');

  public isEditing = false;

  public tableData: TableObject;
  public tableColumns: TableColumn[] = [
    {
      name: '',
      value: '',
      width: '10%'
    },
    {
      name: 'Name',
      value: 'name',
      width: '45%'
    },
    {
      name: 'Company Type',
      value: 'companyType',
      width: '45%'
    }
  ];

  public navigationObject;
  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();
  public contactId = '';
  public isParentCompany = false;

  ngOnInit() {
  this.storageService.state.selectedOrgs = [];
  if (this.navigationStackUtils.getNavigationStack()) {
    this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    if (this.navigationObject.breadcrumbs[0].label === 'Organizations' || this.navigationObject.breadcrumbs[this.navigationObject.breadcrumbs.length - 1].label === 'Add Organization') {
      this.isParentCompany = true;
    }
  } else {
    // TODO: determine where to boot out.
    this.router.navigate(['/']);
  }

  // Detect pins context from static route data; pins routes filter by Indigenous Group
  const companyTypeFilter = this.route.snapshot.data.companyTypeFilter;
  const filterForApi = companyTypeFilter ? { companyType: companyTypeFilter } : {};

  this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(params => {
        if (params.contactId) {
          this.contactId = params.contactId;
          this.isEditing = true;
        }
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '+name';
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        return this.searchService.getSearchResults(
          this.tableParams.keywords || '', 'Organization', null,
          this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy,
          {}, false, filterForApi, ''
        );
      })
    ).subscribe((res: any) => {
      if (res && res[0].data.meta && res[0].data.meta.length > 0) {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.organizations = res[0].data.searchResults;
      } else {
        this.tableParams.totalListItems = 0;
        this.organizations = [];
      }
      this.setRowData();
      this.selectedCount = 0;
    });
}

  save() {
    if (!this.storageService.state.selectedOrgs || this.storageService.state.selectedOrgs.length === 0) {
      this.logger.warn('No organizations selected - aborting save', 'LinkOrganizationComponent');
      alert('Please select at least one organization');
      return;
    }

    const selectedOrgs = [...this.storageService.state.selectedOrgs];
    this.storageService.state.selectedOrgs = [];
    this.storageService.state.selectedOrganization = null;

    const url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();

    if (this.storageService.state.add) {
      // add() is async (HTTP) — it handles navigation on completion
      const addFn = this.storageService.state.add;
      const component = this.storageService.state.component;
      this.storageService.state.add = null;
      addFn(selectedOrgs, component);
    } else {
      this.router.navigate(url);
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  removeSelectedOrg(user) {
    this.storageService.state.selectedOrgs = this.storageService.state.selectedOrgs.filter(function (element) {
      return element._id !== user._id;
    });
    this.tableData.data.map(item => {
      if (user._id === item._id) {
        item.checkbox = false;
      }
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
    params['currentPage'] = currentPage;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize;
    this.router.navigate([...this.router.url.split(';')[0].split('/'), params]);
  }

  setRowData() {
    const dataList = [];
    if (this.organizations && this.organizations.length > 0) {
      this.organizations.forEach(organization => {
        dataList.push(
          {
            name: organization.name,
            companyType: organization.companyType,
            _id: organization._id,
            isEditing: this.isEditing,
            contactId: this.contactId
          }
        );
      });
      this.tableData = new TableObject(
        LinkOrganizationTableRowsComponent,
        dataList,
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

  createOrganization() {
    this.setBreadcrumbs();
    this.router.navigate(['/orgs', 'add']);
  }

  private setBreadcrumbs() {
    const nextBackUrl = [...this.navigationObject.backUrl];
    nextBackUrl.push('link-org');
    const nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
    nextBreadcrumbs.push(
      {
        route: nextBackUrl,
        label: 'Link Organization'
      }
    );
    this.navigationStackUtils.pushNavigationStack(
      nextBackUrl,
      nextBreadcrumbs
    );
  }

  goBack() {
    const url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }

  ngOnDestroy() {
    this.storageService.state.showOrgTableCheckboxes = false;
    this.storageService.state.selectedOrgs = [];
  }
}
