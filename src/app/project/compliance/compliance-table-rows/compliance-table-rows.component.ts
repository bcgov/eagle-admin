import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'tbody[app-compliance-table-rows]',
  templateUrl: './compliance-table-rows.component.html',
  styleUrls: ['./compliance-table-rows.component.scss']
})

export class ComplianceTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public items: any;
  public paginationData: any;
  public loading = false;
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private api: ApiService,
    private router: Router,
  ) { }

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

  async downloadItem(item) {
    this.loading = true;
    try {
      await this.api.downloadInspection(item);
    } catch (err) {
      console.log(err);
    }
    this.loading = false;
  }

  goToItem(item) {
    this.router.navigate(['p', item.project._id, 'compliance', 'i', item._id, 'inspection-details']);
  }
}
