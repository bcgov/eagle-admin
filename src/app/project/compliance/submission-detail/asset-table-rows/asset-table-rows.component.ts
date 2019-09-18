import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

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
    switch (item.internalMime) {
      case 'image/jpeg':
        item['icon'] = 'photo';
        break;
      case 'video/mp4':
        item['icon'] = 'videocam';
        break;
      case 'audio/mpeg':
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

  downloadItem(item) {
    console.log('TODO:', item);
  }

  goToItem(item) {
    this.router.navigate(['p', item.project._id, 'compliance', 'detail', item._id]);
  }
}
