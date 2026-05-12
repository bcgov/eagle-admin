import { Component, OnInit, ChangeDetectionStrategy, input, output } from '@angular/core';

import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { FormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-groups-table-rows]',
    templateUrl: './project-groups-table-rows.component.html',
    styleUrl: './project-groups-table-rows.component.css',
    imports: [FormsModule],
})

export class GroupsTableRowsComponent implements OnInit, TableComponent {
  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();
  selectedCount = output<any>();

  public items: any;
  public paginationData: any;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.items = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
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
