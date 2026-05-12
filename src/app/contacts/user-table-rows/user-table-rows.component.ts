
import { Component, OnInit, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { Router } from '@angular/router';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-user-table-rows',
    templateUrl: './user-table-rows.component.html',
    styleUrl: './user-table-rows.component.css',
    
})
export class UserTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);
  private navigationStackUtils = inject(NavigationStackUtils);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  public contacts: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.contacts = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  editItem(contact) {
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['c/', contact._id, 'edit']);
  }
}
