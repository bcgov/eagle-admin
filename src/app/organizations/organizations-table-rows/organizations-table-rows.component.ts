import { Component, Input, OnInit } from '@angular/core';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

@Component({
  selector: 'app-organizations-table-rows',
  templateUrl: './organizations-table-rows.component.html',
  styleUrls: ['./organizations-table-rows.component.scss']
})
export class OrganizationsTableRowsComponent implements OnInit {
  @Input() data: TableObject;

  public organizations: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.organizations = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  editItem(organization) {
    this.storageService.state.orgForm = null;
    this.storageService.state.selectedOrganization = null;
    this.navigationStackUtils.clearNavigationStack();

    this.storageService.state.orgTableParams = this.data.paginationData;
    this.router.navigate(['o', organization._id, 'edit']);
  }
}
