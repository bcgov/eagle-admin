import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'tbody[app-groups-table-rows]',
    templateUrl: './project-groups-table-rows.component.html',
    styleUrls: ['./project-groups-table-rows.component.css'],
    standalone: true,
    imports: [FormsModule],
})

export class GroupsTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public items: any;
  public paginationData: any;
  public columns: any;
  public useSmallTable: boolean;

  ngOnInit() {
    this.items = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;

    let count = 0;
    this.items.map(doc => {
      if (doc.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit(count);
  }
}
