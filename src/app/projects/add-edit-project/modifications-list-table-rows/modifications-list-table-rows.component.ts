import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
    selector: 'tbody[app-modifications-list-table-rows]',
    templateUrl: './modifications-list-table-rows.component.html',
    styleUrls: ['./modifications-list-table-rows.component.scss']
})

export class ModificationsListTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Output() onItemClicked: EventEmitter<any> = new EventEmitter();

    public items: any;
    public paginationData: any;

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
        this.items = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    itemClicked(item) {
      this.onItemClicked.emit(item);
    }
}
