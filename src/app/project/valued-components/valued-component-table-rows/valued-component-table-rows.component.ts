import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
    selector: 'tbody[app-valued-component-table-rows]',
    templateUrl: './valued-component-table-rows.component.html',
    styleUrls: ['./valued-component-table-rows.component.scss']
})

export class ValuedComponentTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Output() selectedCount: EventEmitter<any> = new EventEmitter();
    @Input() columnData: Array<any>;
    @Input() smallTable: boolean;

    public valuedComponents: any;
    public paginationData: any;
    public columns: any;
    public useSmallTable: boolean;

    ngOnInit() {
        this.valuedComponents = this.data.data;
        this.paginationData = this.data.paginationData;
        this.columns = this.columnData;
        this.useSmallTable = this.smallTable;
    }

    selectItem(item) {
      item.checkbox = !item.checkbox;

      let count = 0;
      this.valuedComponents.map(row => {
        if (row.checkbox === true) {
          count++;
        }
      });
      this.selectedCount.emit(count);
    }
}
