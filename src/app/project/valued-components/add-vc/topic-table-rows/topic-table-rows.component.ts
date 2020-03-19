import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
    selector: 'tbody[app-topic-table-rows]',
    templateUrl: './topic-table-rows.component.html',
    styleUrls: ['./topic-table-rows.component.scss']
})

export class TopicTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Input() columnData: Array<any>;
    @Input() smallTable: boolean;
    @Output() selectedCount: EventEmitter<any> = new EventEmitter();

    public topics: any;
    public paginationData: any;
    public columns: any;
    public useSmallTable: boolean;

    ngOnInit() {
        this.topics = this.data.data;
        this.paginationData = this.data.paginationData;
        this.columns = this.columnData;
        this.useSmallTable = this.smallTable;
    }

    selectItem(item) {
      item.checkbox = !item.checkbox;

      let count = 0;
      this.topics.map(row => {
        if (row.checkbox === true) {
          count++;
        }
      });
      this.selectedCount.emit(count);
    }
}
