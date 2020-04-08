import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Compliance } from 'app/models/compliance';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { MatSnackBar } from '@angular/material';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { AssetTableRowsComponent } from '../submission-detail/asset-table-rows/asset-table-rows.component';
import { SearchTerms } from 'app/models/search';
import { SearchService } from 'app/services/search.service';

@Component({
  selector: 'app-inspection-detail',
  templateUrl: './inspection-detail.component.html',
  styleUrls: ['./inspection-detail.component.scss']
})
export class InspectionDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public terms = new SearchTerms();
  public compliance: Compliance = null;
  public currentProject: Project = null;
  public elements: any[] = [];
  public assets = [];
  public submission: any = null;
  public publishText: string;
  public loading = true;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public showTable = true;
  public tableColumns: any[] = [
    {
      name: 'Assets',
      value: 'internalExt',
      width: '15%',
      nosort: true
    },
    {
      name: 'Caption',
      value: 'caption',
      width: '25%',
      nosort: true
    },
    {
      name: 'UTM Coordinates',
      value: 'geo',
      width: '15%',
      nosort: true
    },
    {
      name: 'Date/Time Taken',
      value: 'date',
      width: '20%',
      nosort: true
    },
    {
      name: 'Actions',
      value: 'actions',
      width: '25%',
      nosort: true
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    public api: ApiService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res && res.compliance && res.compliance.data) {

          this.compliance = new Compliance(res.compliance.data);
          if (this.compliance.label) {
            this.compliance.label = this.compliance.label.replace(new RegExp('\n', 'g'), '<br />');
          }
          // Adding itemClicked to the elements to track the icons
          this.elements = this.compliance.elements.map(el => {
            let newEl = {...el, itemClicked: false};
            return newEl;
          });
          this.loading = false;
        } else {
          this.openSnackBar('Error, Please try again', 'Close');
          this.loading = false;
        }
        });
  }

  openElement(element) {
    if (!element.items.length || element.items.length === 0) {
      // No assets so don't fire request
      return;
    }
    this.loading = true;
    const loadTable = this.handleElementClicked(element);
    if (!loadTable) {
      return;
    }
    this.searchService.getItem(element._id, 'InspectionElement')
      .subscribe((res: any) => {
        if (!res || !res.data) {
          this.loading = false;
          return;
        }
        this.submission = res.data;
        this.submission.description = this.submission.description.replace(new RegExp('\n', 'g'), '<br />');

        this.assets = this.submission.items;
        for (let i = 0; i < this.assets.length; i++) {
          this.assets[i].timestamp = new Date(this.assets[i].timestamp);
        }
        this.tableParams.totalListItems = this.assets.length;
        this.tableParams.currentPage = 1;
        this.tableParams.pageSize = 100000;
        this.setRowData();
        this.loading = false;
        let showError = false;


        this.assets.forEach(async z => {
          if (z.type === 'photo') {
            // Show thumb
            let resource = await this.api.downloadElementThumbnail(this.compliance._id, this.submission._id, z._id)
            .catch(() => {
              showError = true;
            });
            if (!resource) {
              // There was an error so return
              if (showError) {
                this.openSnackBar('Error: Thumbnail(s) cannot load', 'Close');
              }
              return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(resource);
            reader.onloadend = function () {
              // result includes identifier 'data:image/png;base64,' plus the base64 data
              z.src = reader.result;
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
  handleElementClicked(element) {
    // If an item is clicked need to make sure every other item is unclicked.
    this.elements.forEach(i => {
      if (i._id !== element._id) {
        i.itemClicked = false;
      }
    });
    if (element.itemClicked) {
      // Don't load any items, because the same item has been clicked
      this.loading = false;
      element.itemClicked = !element.itemClicked;
      this.nukeTableData();
      return false;
    }
    this.showTable = true;
    element.itemClicked = !element.itemClicked;
    return true;
  }
  nukeTableData() {
    this.tableParams = new TableParamsObject();
    this.showTable = false;
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

  async download() {
    this.loading = true;
    try {
      await this.api.downloadInspection(this.compliance);
    } catch (err) {
      console.log(err);
    }
    this.loading = false;
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
