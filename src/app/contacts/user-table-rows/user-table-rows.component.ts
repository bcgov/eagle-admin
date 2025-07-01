import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
    selector: 'app-user-table-rows',
    templateUrl: './user-table-rows.component.html',
    styleUrls: ['./user-table-rows.component.scss'],
    standalone: true,
    imports: [CommonModule],
    
})
export class UserTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  public contacts: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils
  ) { }

  ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  editItem(contact) {
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['c/', contact._id, 'edit']);
  }
}
