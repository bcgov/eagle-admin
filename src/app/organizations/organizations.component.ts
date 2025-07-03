import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrganizationsTableRowsComponent } from './organizations-table-rows/organizations-table-rows.component';
import { Org } from '../models/org';
import { SearchTerms } from '../models/search';
import { StorageService } from '../services/storage.service';
import { TableObject } from '../shared/components/table-template/table-object';
import { TableParamsObject } from '../shared/components/table-template/table-params-object';
import { NavigationStackUtils } from '../shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from '../shared/components/table-template/table-template.component';

@Component({
    selector: 'app-organizations',
    standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      FormsModule,
      TableTemplateComponent
    ],
    templateUrl: './organizations.component.html',
    styleUrls: ['./organizations.component.css'],
    
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private navigationStackUtils = inject(NavigationStackUtils);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private storageService = inject(StorageService);

  public terms = new SearchTerms();
  private subscriptions = new Subscription();
  public organizations: Org[] = null;
  public loading = true;

  public tableData: TableObject;
  public tableColumns: any[] = [
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

    this.subscriptions.add(
      this.route.params
        .subscribe(params => {
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

          this.subscriptions.add(
            this.route.data
              .subscribe((res: any) => {
                if (res && res.orgs && res.orgs[0].data.meta && res.orgs[0].data.meta.length > 0) {
                  this.tableParams.totalListItems = res.orgs[0].data.meta[0].searchResultsTotal;
                  this.organizations = res.orgs[0].data.searchResults;
                } else {
                  this.tableParams.totalListItems = 0;
                  this.organizations = [];
                }
                this.setRowData();
                this.loading = false;
                this._changeDetectionRef.detectChanges();
              })
          );
        })
    );
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
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
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
