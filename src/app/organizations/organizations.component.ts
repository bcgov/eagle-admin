import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { OrganizationsTableRowsComponent } from './organizations-table-rows/organizations-table-rows.component';
import { Organization } from '../models/demi/organization';
import { SearchTerms } from '../models/search';
import { StorageService } from '../services/storage.service';
import { TableObject, TableColumn } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { NavigationStackUtils } from '../shared/utils/navigation-stack-utils';
import { TableTemplateUtils, nextSortBy, nativeSort } from '../shared/utils/table-template-utils';
import { OrgService, ORG_LIST_LOADING } from '../services/org.service';
import { LoadingStateService } from '../services/loading-state.service';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';

const SORT_KEYS = ['name', 'companyType', 'companyLegal'];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-organizations',
    imports: [
      RouterModule,
      FormsModule,
      TableTemplateComponent
    ],
    templateUrl: './organizations.component.html',
    styleUrl: './organizations.component.css',
    
})
export class OrganizationsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private navigationStackUtils = inject(NavigationStackUtils);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private storageService = inject(StorageService);
  private orgService = inject(OrgService);
  public loadingState = inject(LoadingStateService);
  public loading = this.loadingState.getOperationState(ORG_LIST_LOADING);

  public terms = new SearchTerms();
  public organizations: Organization[] = null;

  public tableData: TableObject;
  public tableColumns: TableColumn[] = [
    {
      name: 'Name',
      value: 'name',
      width: '35%'
    },
    {
      name: 'Organization Type',
      value: 'companyType',
      width: '20%'
    },
    {
      name: 'Company Legal',
      value: 'companyLegal',
      width: '35%'
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
  public orgTypeFilter = {
    filterList: [],
    indigenousGroup: false,
    proponent: false,
    otherAgency: false,
    localGovernment: false,
    municipality: false,
    ministry: false,
    consultant: false,
    otherGovernment: false,
    communityGroup: false,
    other: false
  };

  ngOnInit() {
    this.storageService.state.orgForm = null;
    this.storageService.state.selectedProject = null;

    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(params => {
          if (this.storageService.state.orgTableParams) {
            this.tableParams = this.storageService.state.orgTableParams;
            this.storageService.state.orgTableParams = null;
          } else {
            this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, null, ['companyType']);
            if (this.tableParams.sortBy === '') {
              this.tableParams.sortBy = '+name';
            }
          }
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.filter, this.tableParams.keywords);

          if (this.tableParams.filter && this.tableParams.filter.companyType) {
            this.setFilterButtons();
          }

          const companyType = this.tableParams.filter?.companyType
            ? this.getFiltersForApi(this.tableParams.filter.companyType)
            : [];

          return this.orgService.listOrganizations({
            page: this.tableParams.currentPage,
            pageSize: this.tableParams.pageSize,
            count: true,
            sort: nativeSort(this.tableParams.sortBy, 'name', SORT_KEYS),
            q: this.tableParams.keywords || undefined,
            filters: { companyType: companyType.length ? companyType : undefined }
          });
        })
      ).subscribe(res => {
        this.tableParams.totalListItems = res.total ?? 0;
        this.organizations = res.rows;
        this.setRowData();
      });
  }

  private getFiltersForApi(typeFilterString: string): string[] {
    const typeFiltersFromRoute = typeFilterString.split(',');
    const typeFiltersForApi = [];
    if (typeFiltersFromRoute.includes('indigenousGroup')) { typeFiltersForApi.push('Indigenous Group'); }
    if (typeFiltersFromRoute.includes('proponent')) { typeFiltersForApi.push('Proponent/Certificate Holder'); }
    if (typeFiltersFromRoute.includes('otherAgency')) { typeFiltersForApi.push('Other Agency'); }
    if (typeFiltersFromRoute.includes('localGovernment')) { typeFiltersForApi.push('Local Government'); }
    if (typeFiltersFromRoute.includes('municipality')) { typeFiltersForApi.push('Municipality'); }
    if (typeFiltersFromRoute.includes('ministry')) { typeFiltersForApi.push('Ministry'); }
    if (typeFiltersFromRoute.includes('consultant')) { typeFiltersForApi.push('Consultant'); }
    if (typeFiltersFromRoute.includes('otherGovernment')) { typeFiltersForApi.push('Other Government'); }
    if (typeFiltersFromRoute.includes('communityGroup')) { typeFiltersForApi.push('Community Group'); }
    if (typeFiltersFromRoute.includes('other')) { typeFiltersForApi.push('Other'); }
    return typeFiltersForApi;
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // Angular Router ignores navigation to the current URL;
    // the `ms` param changes the URL so the list reloads.

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['currentPage'] = this.tableParams.currentPage = currentPage;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    params['sortBy'] = this.tableParams.sortBy;

    if (this.orgTypeFilter.filterList.length > 0) {
      params['companyType'] = this.orgTypeFilter.filterList.toString();
      this.tableParams.filter = { companyType: params.companyType };
    }

    this.router.navigate(['orgs', params]);
  }

  setRowData() {
    if (this.organizations && this.organizations.length > 0) {
      const list = [...this.organizations];
      this.tableData = new TableObject(
        OrganizationsTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.onSubmit(1);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  addOrganization() {
    this.storageService.state.orgForm = null;
    this.storageService.state.selectedOrganization = null;
    this.navigationStackUtils.clearNavigationStack();
    this.storageService.state.orgTableParams = this.tableParams;
    this.router.navigate(['orgs', 'add']);
  }

  setFilterButtons() {
    const typeFiltersFromRoute = this.tableParams.filter.companyType.split(',');

    this.orgTypeFilter.indigenousGroup = typeFiltersFromRoute.includes('indigenousGroup');
    this.orgTypeFilter.proponent = typeFiltersFromRoute.includes('proponent');
    this.orgTypeFilter.otherAgency = typeFiltersFromRoute.includes('otherAgency');
    this.orgTypeFilter.localGovernment = typeFiltersFromRoute.includes('localGovernment');
    this.orgTypeFilter.municipality = typeFiltersFromRoute.includes('municipality');
    this.orgTypeFilter.ministry = typeFiltersFromRoute.includes('ministry');
    this.orgTypeFilter.consultant = typeFiltersFromRoute.includes('consultant');
    this.orgTypeFilter.otherGovernment = typeFiltersFromRoute.includes('otherGovernment');
    this.orgTypeFilter.communityGroup = typeFiltersFromRoute.includes('communityGroup');
    this.orgTypeFilter.other = typeFiltersFromRoute.includes('other');
  }

  setFilter() {
    this.orgTypeFilter.filterList = [];
    if (this.orgTypeFilter.indigenousGroup) {
      this.orgTypeFilter.filterList.push('indigenousGroup');
    }
    if (this.orgTypeFilter.proponent) {
      this.orgTypeFilter.filterList.push('proponent');
    }
    if (this.orgTypeFilter.otherAgency) {
      this.orgTypeFilter.filterList.push('otherAgency');
    }
    if (this.orgTypeFilter.localGovernment) {
      this.orgTypeFilter.filterList.push('localGovernment');
    }
    if (this.orgTypeFilter.municipality) {
      this.orgTypeFilter.filterList.push('municipality');
    }
    if (this.orgTypeFilter.ministry) {
      this.orgTypeFilter.filterList.push('ministry');
    }
    if (this.orgTypeFilter.consultant) {
      this.orgTypeFilter.filterList.push('consultant');
    }
    if (this.orgTypeFilter.otherGovernment) {
      this.orgTypeFilter.filterList.push('otherGovernment');
    }
    if (this.orgTypeFilter.communityGroup) {
      this.orgTypeFilter.filterList.push('communityGroup');
    }
    if (this.orgTypeFilter.other) {
      this.orgTypeFilter.filterList.push('other');
    }
    this.onSubmit();
  }

}
