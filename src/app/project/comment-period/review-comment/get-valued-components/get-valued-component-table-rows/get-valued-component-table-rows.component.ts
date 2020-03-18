import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'tbody[app-get-valued-component-table-rows]',
  templateUrl: './get-valued-component-table-rows.component.html',
  styleUrls: ['./get-valued-component-table-rows.component.scss']
})

export class GetValuedComponentTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public valuedComponents: any;
  public paginationData: any;
  public selectedVCs;
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.valuedComponents = this.data.data;
    this.paginationData = this.data.paginationData;
    this.selectedVCs = this.storageService.state.currentVCs.data;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;

    if (item.checkbox) {
      this.selectedVCs.push(item._id);
    } else {
      this.selectedVCs.splice( this.selectedVCs.indexOf(item._id), 1 );
    }

    let count = 0;
    this.valuedComponents.map(row => {
      if (row.checkbox === true) {
        count++;
      } else {
      }
    });
    this.selectedCount.emit(count);
  }
}
