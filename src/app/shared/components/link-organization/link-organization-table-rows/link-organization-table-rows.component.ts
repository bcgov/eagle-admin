import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

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

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.organizations = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    this.storageService.state.selectedOrganization = item;

    if (this.storageService.state.add) {
      let arr = [];
      arr.push(item);
      this.storageService.state.add(arr, this.storageService.state.component);
      this.storageService.state.selectedOrganization = null;
      this.storageService.state.add = null;
    }

    let url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }
}
