import { Component, Input, Output, OnInit, EventEmitter, OnDestroy } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { Org } from 'app/models/org';

@Component({
  selector: 'tbody[app-link-organization-table-rows]',
  templateUrl: './link-organization-table-rows.component.html',
  styleUrls: ['./link-organization-table-rows.component.scss']
})

export class LinkOrganizationTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public organizations: any;
  public paginationData: any;
  public showCheckboxes = false;

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.organizations = this.data.data;
    this.showCheckboxes = this.storageService.state.showOrgTableCheckboxes;
    this.paginationData = this.data.paginationData;
    this.organizations.forEach((org: Org) => {
      org.checkbox = this.storageService.state.selectedOrgs.some(element => {
        return org._id === element._id;
      });
    });
  }

  selectItem(item: Org): void {
    item.checkbox = !item.checkbox;
    if (this.storageService.state.selectedOrgs || this.storageService.state.selectedOrgs === []) {
      if (item.checkbox) {
        this.storageService.state.selectedOrgs.push(item);
      } else {
        this.storageService.state.selectedOrgs = this.storageService.state.selectedOrgs.filter(function (value, index, arr) {
          return value._id !== item._id;
        });
      }
    }
  }

  onRowClick(item: Org): void {
    this.showCheckboxes ? this.selectItem(item) : this.saveSingleItem(item);
  }

  saveSingleItem(item: Org): void {
    this.storageService.state.selectedOrganization = item;

    if (this.storageService.state.add) {
      let arr = [];
      arr.push(item);
      this.storageService.state.add(arr, this.storageService.state.component);
      this.storageService.state.selectedOrganization = null;
      this.storageService.state.add = null;
    }
  }


}
