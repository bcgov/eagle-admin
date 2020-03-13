import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
  selector: 'tbody[app-cac-table-rows]',
  templateUrl: './cac-table-rows.component.html',
  styleUrls: ['./cac-table-rows.component.scss']
})

export class CACTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public items: any;
  public paginationData: any;

  constructor(
  ) { }

  async ngOnInit() {
    this.items = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;

    let count = 0;
    this.items.forEach(doc => {
      if (doc.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit(count);
  }
}
