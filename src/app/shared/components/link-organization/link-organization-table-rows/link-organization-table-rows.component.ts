import { Component, Input, Output, OnInit, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Org } from 'src/app/models/org';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableObject } from '../../table-template/table-object';
import { TableComponent } from '../../table-template/table.component';


@Component({
  selector: 'tbody[app-link-organization-table-rows]',
  templateUrl: './link-organization-table-rows.component.html',
  styleUrls: ['./link-organization-table-rows.component.css'],
  standalone: true,
  imports: [],
})

export class LinkOrganizationTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);
  private navigationStackUtils = inject(NavigationStackUtils);
  private storageService = inject(StorageService);

  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public organizations: any;
  public paginationData: any;
  public showCheckboxes = false;
  public columns: any;
  public useSmallTable: boolean;

  ngOnInit() {
    this.organizations = this.data.data;
    this.showCheckboxes = this.storageService.state.showOrgTableCheckboxes;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
    this.organizations.forEach((org: Org) => {
      org.checkbox = this.storageService.state.selectedOrgs.some(element => {
        return org._id === element._id;
      });
    });
  }

  selectItem(item: Org): void {
    item.checkbox = !item.checkbox;
    if (Array.isArray(this.storageService.state.selectedOrgs)) {
      if (item.checkbox) {
        this.storageService.state.selectedOrgs.push(item);
      } else {
        this.storageService.state.selectedOrgs = this.storageService.state.selectedOrgs.filter(function (value) {
          return value._id !== item._id;
        });
      }
    }
  }

  onRowClick(item: Org): void {
    if (this.showCheckboxes) {
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
