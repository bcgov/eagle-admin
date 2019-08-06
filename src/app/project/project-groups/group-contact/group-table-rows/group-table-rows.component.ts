import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-group-table-rows',
  templateUrl: './group-table-rows.component.html',
  styleUrls: ['./group-table-rows.component.scss']
})
export class GroupTableRowsComponent implements OnInit {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public contacts: any;
  public paginationData: any;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;

    let count = 0;
    this.contacts.map(row => {
      if (row.checkbox === true) {
        count++;
      }
    });

    if (this.storageService.state.selectedUsers) {
      if (item.checkbox) {
        this.storageService.state.selectedUsers.push(item);
      } else {
        this.storageService.state.selectedUsers = this.storageService.state.selectedUsers.filter(function (value, index, arr) {
          return value._id !== item._id;
        });
      }
    }
    this.selectedCount.emit(count);
  }
}
