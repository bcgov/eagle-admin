import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
    selector: 'app-organizations-table-rows',
    templateUrl: './organizations-table-rows.component.html',
    styleUrls: ['./organizations-table-rows.component.css'],
    standalone: true,
    imports: [],
    
})
export class OrganizationsTableRowsComponent implements OnInit {
  private router = inject(Router);
  private navigationStackUtils = inject(NavigationStackUtils);
  private storageService = inject(StorageService);

  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  public organizations: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: any;
  public useSmallTable: boolean;

  ngOnInit() {
    this.organizations = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  editItem(organization) {
    this.storageService.state.orgForm = null;
    this.storageService.state.selectedOrganization = null;
    this.navigationStackUtils.clearNavigationStack();

    this.storageService.state.orgTableParams = this.data.paginationData;
    this.router.navigate(['o', organization._id, 'edit']);
  }
}
