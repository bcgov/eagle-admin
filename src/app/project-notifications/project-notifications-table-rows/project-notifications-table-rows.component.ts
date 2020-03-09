import { Component, Input, OnInit } from '@angular/core';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

@Component({
  selector: 'app-notification-project-table-rows',
  templateUrl: './project-notifications-table-rows.component.html',
  styleUrls: ['./project-notifications-table-rows.component.scss']
})
export class ProjectNotificationTableRowsComponent implements OnInit {
  @Input() data: TableObject;

  public items: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils
  ) { }

  ngOnInit() {
    this.items = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  goToItem(item) {
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['pn/', item._id, 'notification-project-details']);
  }
}
