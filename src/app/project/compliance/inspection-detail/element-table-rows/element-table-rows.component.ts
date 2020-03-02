import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { AssetTableRowsComponent } from '../../submission-detail/asset-table-rows/asset-table-rows.component';
import { SearchService } from 'app/services/search.service';
import { Compliance } from 'app/models/compliance';
import { ApiService } from 'app/services/api';
@Component({
  selector: 'tbody[app-element-table-rows]',
  templateUrl: './element-table-rows.component.html',
  styleUrls: ['./element-table-rows.component.scss']
})

export class ElementTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public items: any;
  public elements: any;
  public paginationData: any;
  public compliance: Compliance = null;
  public submission: any = null;
  public loading = false;
  public showTable = true;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public itemClicked = false;
  public lastClicked: String;
  public assets = [];
  public tableColumns: any[] = [
    {
      name: 'Assets',
      value: 'internalExt',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Caption',
      value: 'caption',
      width: 'col-4',
      nosort: true
    },
    {
      name: 'GPS Coordinates',
      value: 'geo',
      width: 'col-3',
      nosort: true
    },
    {
      name: 'Actions',
      value: 'actions',
      width: 'col-3',
      nosort: true
    }
  ];
  constructor(
    private storageService: StorageService,
    private searchService: SearchService,
    private _changeDetectionRef: ChangeDetectorRef,
    public api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.items = this.data.data;
    this.paginationData = this.data.paginationData;

  }
  openItem(item) {
    // Need to figure out the toggling of the icon which needs to toggle item clicked
    this.loading = true;
    this.handleItemClicked(item);
    // Load elements here
    // This is to get the submission inspection element
    // Make sure to cache this
    this.searchService.getItem(item._id, 'InspectionElement')
      .subscribe((res: any) => {
        if (!res || !res.data) {
          this.loading = false;
          return;
        }
        this.compliance = new Compliance(res.data);
        this.submission = res.data;
        this.submission.description = this.submission.description.replace(new RegExp('\n', 'g'), '<br />');

        this.assets = this.submission.items;
        // This is to make sure we are using the browsers timezone.
        for (let i = 0; i < this.assets.length; i++) {
          this.assets[i].timestamp = new Date(this.assets[i].timestamp);
        }
        this.tableParams.totalListItems = this.assets.length;
        this.tableParams.currentPage = 1;
        this.tableParams.pageSize = 100000;
        this.setRowData();
        this.loading = false;
        // this._changeDetectionRef.detectChanges();

        let self = this;

        self.assets.map(async z => {
          if (z.type === 'photo') {
            // Show thumb
            let resource = await self.api.downloadElementThumbnail(self.compliance._id, self.submission._id, z._id);
            const reader = new FileReader();
            reader.readAsDataURL(resource);
            reader.onloadend = function () {
              // result includes identifier 'data:image/png;base64,' plus the base64 data
              z.src = reader.result;
              // self._changeDetectionRef.detectChanges();
            };
          } else if (z.type === 'video') {
            // Show it's type with a clickable event.
          } else if (z.type === 'voice') {
            // Show it's type with a clickable event.
          } else if (z.type === 'text') {
            // Show it's type with a clickable event.
          }
        });
      });
  }
  handleItemClicked(item) {
    // If an item is clicked need to make sure every other item is unclicked.
    const newItems = [];
    this.items.forEach(i => {
      if (i._id !== item._id) {
        i.itemClicked = false;
      }
      newItems.push(i);
    });
    this.items = [...newItems];
    if (item.itemClicked) {
      // Don't load any items, because the same item has been clicked
      this.loading = false;
      item.itemClicked = !item.itemClicked;
      this.nukeTableData();
      return;
    }
    this.showTable = true;
    item.itemClicked = !item.itemClicked;
  }
  nukeTableData() {
    this.tableParams = new TableParamsObject();
    this.showTable = false;
    // This doesn't seem to do anything
  }
  setRowData() {
    if (this.assets && this.assets.length > 0) {
      this.tableData = new TableObject(
        AssetTableRowsComponent,
        this.assets,
        this.tableParams,
        {
          inspection: this.compliance,
          elementId: this.submission._id
        }
      );
    }
  }
  downloadElement(element) {
    // Download the element here

  }
}
