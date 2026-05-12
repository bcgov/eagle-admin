import { Component, OnInit, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-notification-project-table-rows',
    templateUrl: './project-notifications-table-rows.component.html',
    styleUrl: './project-notifications-table-rows.component.css',
    
})
export class ProjectNotificationTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);
  private navigationStackUtils = inject(NavigationStackUtils);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();
  selectedCount = output<any>();

  public items: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];

  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.items = this.data().data;
    this.paginationData = this.data().paginationData;

    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  goToItem(item) {
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['pn/', item._id, 'details']);
  }
}
