import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'tbody[app-element-table-rows]',
  templateUrl: './element-table-rows.component.html',
  styleUrls: ['./element-table-rows.component.scss']
})

export class ElementTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public items: any;
  public paginationData: any;

  constructor(
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.items = this.data.data;
    this.paginationData = this.data.paginationData;

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

  downloadItem(item) {
    console.log('TODO:', item);
  }

  goToItem(item) {
    this.router.navigate(['p', this.storageService.state.currentProject.data._id, 'compliance', 'i', this.storageService.state.selectedInspection._id, 's', item._id]);
  }
}
