import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
    selector: 'app-notification-project-table-rows',
    templateUrl: './project-notifications-table-rows.component.html',
    styleUrls: ['./project-notifications-table-rows.component.css'],
    standalone: true,
    imports: [],
    
})
export class ProjectNotificationTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public items: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];

  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils
  ) { }

  ngOnInit() {
    this.items = this.data.data;
    this.paginationData = this.data.paginationData;

    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  goToItem(item) {
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['pn/', item._id, 'details']);
  }
}
