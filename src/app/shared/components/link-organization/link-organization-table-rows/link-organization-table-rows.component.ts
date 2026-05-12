import { Component, OnInit, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Org } from 'src/app/models/org';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableObject, TableColumn } from '../../table-template/table-object';
import { TableComponent } from '../../table-template/table.component';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tbody[app-link-organization-table-rows]',
  templateUrl: './link-organization-table-rows.component.html',
  styleUrl: './link-organization-table-rows.component.css',
  imports: [FormsModule],
})

export class LinkOrganizationTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);
  private navigationStackUtils = inject(NavigationStackUtils);
  private storageService = inject(StorageService);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();
  selectedCount = output<any>();

  public organizations: any;
  public paginationData: any;
  public showCheckboxes = false;
  public columns: TableColumn[];
  public useSmallTable: boolean;

ngOnInit() {
  this.organizations = this.data().data;
  this.showCheckboxes = this.storageService.state.showOrgTableCheckboxes;
  this.paginationData = this.data().paginationData;
  this.columns = this.columnData();
  this.useSmallTable = this.smallTable();
  if (!Array.isArray(this.storageService.state.selectedOrgs)) {
    this.storageService.state.selectedOrgs = [];
  }
  this.organizations.forEach((org: Org) => {
    org.checkbox = this.storageService.state.selectedOrgs.some(element => {
      return org._id === element._id;
    });
  });
  this.selectedCount.emit(this.storageService.state.selectedOrgs.length);
}

onCheckboxChange(item: Org): void {
  this.selectItem(item);
}

  selectItem(item: Org): void {
    if (!Array.isArray(this.storageService.state.selectedOrgs)) {
      this.storageService.state.selectedOrgs = [];
    }
    
    if (item.checkbox) {
      const exists = this.storageService.state.selectedOrgs.some(org => org._id === item._id);
      if (!exists) {
        this.storageService.state.selectedOrgs.push(item);
      }
    } else {
      this.storageService.state.selectedOrgs = this.storageService.state.selectedOrgs.filter(function (value) {
        return value._id !== item._id;
      });
    }
    this.selectedCount.emit(this.storageService.state.selectedOrgs.length);
  }

onRowClick(item: Org): void {
  if (this.showCheckboxes) {
    item.checkbox = !item.checkbox;
    this.selectItem(item);
  } else {
    this.saveSingleItem(item);
  }
}

  saveSingleItem(item: Org): void {
    this.storageService.state.selectedOrganization = item;

    if (this.storageService.state.add) {
      const arr = [];
      arr.push(item);
      this.storageService.state.add(arr, this.storageService.state.component);
      this.storageService.state.selectedOrganization = null;
      this.storageService.state.add = null;
    }

    const url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }


}
