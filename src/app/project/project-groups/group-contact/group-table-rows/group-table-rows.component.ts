import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-table-rows',
  templateUrl: './group-table-rows.component.html',
  styleUrls: ['./group-table-rows.component.scss']
})
export class GroupTableRowsComponent implements OnInit {
    @Input() data: TableObject;
    @Output() selectedCount: EventEmitter<any> = new EventEmitter();

    public contacts: any;
    public paginationData: any;

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
        this.contacts = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    selectItem(item) {
      item.checkbox = !item.checkbox;

      let count = 0;
      this.contacts.map(row => {
        if (row.checkbox === true) {
          count++;
        }
      });
      this.selectedCount.emit(count);
    }
}
