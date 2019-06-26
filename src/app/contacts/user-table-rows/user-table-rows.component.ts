import { Component, Input, OnInit } from '@angular/core';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-table-rows',
  templateUrl: './user-table-rows.component.html',
  styleUrls: ['./user-table-rows.component.scss']
})
export class UserTableRowsComponent implements OnInit {
  @Input() data: TableObject;

  public contacts: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  editItem(contact) {
    this.router.navigate(['c/', contact._id, 'edit']);
  }
}
