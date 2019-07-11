import { Component, Input, OnInit } from '@angular/core';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

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
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.organizations = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  editItem(organization) {
    this.storageService.state.orgForm = null;
    this.storageService.state.selectedOrganization = null;
    this.storageService.state.backUrl = null;
    this.storageService.state.breadcrumbs = null;
    this.router.navigate(['o', organization._id, 'edit']);
  }
}
