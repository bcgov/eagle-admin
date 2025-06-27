import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { LinkOrganizationTableRowsComponent } from './link-organization-table-rows/link-organization-table-rows.component';
import { Org } from 'src/app/models/org';
import { SearchTerms } from 'src/app/models/search';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { TableTemplateUtils } from '../../utils/table-template-utils';
import { TableObject } from '../table-template/table-object';
import { TableParamsObject } from '../table-template/table-params-object';


@Component({
  selector: 'app-link-organization',
  templateUrl: './link-organization.component.html',
  styleUrls: ['./link-organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkOrganizationComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private subscriptions = new Subscription();
  public organizations: Org[] = null;
  public loading = true;

  public isEditing = false;

  public tableData: TableObject;
  public tableColumns: any[] = [
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

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    public storageService: StorageService,
    public navigationStackUtils: NavigationStackUtils,
    public tableTemplateUtils: TableTemplateUtils
  ) { }

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

    // get data from route resolver
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        if (params.contactId) {
          this.contactId = params.contactId;
          this.isEditing = true;
        }
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '+name';
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
      })
    );

    this.subscriptions.add(
      this.route.data.subscribe((res: any) => {
        if (res) {
          if (res.organizations[0].data.meta && res.organizations[0].data.meta.length > 0) {
            this.tableParams.totalListItems = res.organizations[0].data.meta[0].searchResultsTotal;
            this.organizations = res.organizations[0].data.searchResults;
          } else {
            this.tableParams.totalListItems = 0;
            this.organizations = [];
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

  save() {
    this.storageService.state.selectedOrgs.forEach((org: Org) => {
      const arr: Org[] = [];
      arr.push(org);
      this.storageService.state.add(arr, this.storageService.state.component);
    });
    this.storageService.state.selectedOrganization = null;
    this.storageService.state.add = null;
    const url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
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
    this._changeDetectionRef.detectChanges();
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
    this.subscriptions.unsubscribe();
  }
}
