import { Component, Input, OnInit, EventEmitter, Output, inject } from '@angular/core';

import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';

@Component({
    selector: 'app-group-table-rows',
    templateUrl: './group-table-rows.component.html',
    styleUrls: ['./group-table-rows.component.css'],
    standalone: true,
    imports: [],
    
})
export class GroupTableRowsComponent implements OnInit {
  private storageService = inject(StorageService);

  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  public contacts: any;
  public paginationData: any;
  public columns: any;
  public useSmallTable: boolean;

  ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
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
        this.storageService.state.selectedUsers = this.storageService.state.selectedUsers.filter(function (value) {
          return value._id !== item._id;
        });
      }
    }
    this.selectedCount.emit(count);
  }
}
