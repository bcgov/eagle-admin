import { Component, OnInit, inject, ChangeDetectionStrategy, input, output } from '@angular/core';

import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { FormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-group-table-rows',
    templateUrl: './group-table-rows.component.html',
    styleUrl: './group-table-rows.component.css',
    imports: [FormsModule]
})
export class GroupTableRowsComponent implements OnInit {
  private storageService = inject(StorageService);

  data = input.required<TableObject>();
  selectedCount = output<any>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  public contacts: any;
  public paginationData: any;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.contacts = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
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
