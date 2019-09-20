import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'tbody[app-asset-table-rows]',
  templateUrl: './asset-table-rows.component.html',
  styleUrls: ['./asset-table-rows.component.scss']
})

export class AssetTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public items: any;
  public paginationData: any;
  public icon: any;

  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.items = this.data.data;
    this.paginationData = this.data.paginationData;
    this.items.map(item => {
      this.getAssetIcon(item);
    });
  }

  getAssetIcon(item) {
    switch (item.type) {
      case 'photo':
        item['icon'] = 'photo';
        break;
      case 'video':
        item['icon'] = 'videocam';
        break;
      case 'voice':
        item['icon'] = 'mic';
        break;
      default:
        item['icon'] = 'insert_drive_file';
    }
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
    let res = await this.api.downloadInspectionItem(this.data.extraData.inspectionId, this.data.extraData.elementId, item);
  }

  goToItem(item) {
    this.router.navigate(['p', item.project._id, 'compliance', 'detail', item._id]);
  }
}
