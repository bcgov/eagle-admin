import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
    selector: 'tbody[app-modifications-list-table-rows]',
    templateUrl: './modifications-list-table-rows.component.html',
    styleUrls: ['./modifications-list-table-rows.component.scss'],
    standalone: false
})

export class ModificationsListTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Input() columnData: Array<any>;
    @Input() smallTable: boolean;
    @Output() onItemClicked: EventEmitter<any> = new EventEmitter();

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

    itemClicked(item) {
        this.onItemClicked.emit(item);
    }
}
