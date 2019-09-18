import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Compliance } from 'app/models/compliance';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { MatSnackBar } from '@angular/material';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { AssetTableRowsComponent } from './asset-table-rows/asset-table-rows.component';

@Component({
  selector: 'app-submission-detail-detail',
  templateUrl: './submission-detail.component.html',
  styleUrls: ['./submission-detail.component.scss']
})
export class SubmissionDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public compliance: Compliance = null;
  public submission: any = null;
  public assets = [];
  public currentProject: Project = null;
  public publishText: string;
  public loading = true;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[] = [
    // TODO: this needs to be replaced with an icon.
    {
      name: 'Assets',
      value: 'internalExt',
      width: 'col-4'
    },
    {
      name: 'Caption',
      value: 'caption',
      width: 'col-4'
    },
    {
      name: 'GPS Coordinates',
      value: 'geo',
      width: 'col-4'
    },
    // {
    //   name: 'Date Submitted',
    //   value: '',
    //   width: 'col-3'
    // }
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.compliance = res.compliance.data;
        this.submission = res.submission.data;

        this.assets = this.submission.items;
        this.tableParams.totalListItems = this.assets.length;
        this.tableParams.currentPage = 1;
        this.tableParams.pageSize = 100000;
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  setRowData() {
    if (this.assets && this.assets.length > 0) {
      this.tableData = new TableObject(
        AssetTableRowsComponent,
        this.assets,
        this.tableParams
      );
    }
  }
  download() {
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
