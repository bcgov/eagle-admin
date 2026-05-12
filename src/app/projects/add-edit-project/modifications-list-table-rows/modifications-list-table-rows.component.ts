import { Component, OnInit, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-modifications-list-table-rows]',
    templateUrl: './modifications-list-table-rows.component.html',
    styleUrl: './modifications-list-table-rows.component.css',
    imports: [DatePipe],
})

export class ModificationsListTableRowsComponent implements OnInit, TableComponent {
    data = input.required<TableObject>();
    columnData = input.required<TableColumn[]>();
    smallTable = input.required<boolean>();
    onItemClicked = output<any>();

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

    itemClicked(item) {
        this.onItemClicked.emit(item);
    }
}
