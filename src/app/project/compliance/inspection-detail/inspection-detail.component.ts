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
import { ElementTableRowsComponent } from './element-table-rows/element-table-rows.component';

@Component({
  selector: 'app-inspection-detail',
  templateUrl: './inspection-detail.component.html',
  styleUrls: ['./inspection-detail.component.scss']
})
export class InspectionDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public compliance: Compliance = null;
  public currentProject: Project = null;
  public elements: any[] = [];
  public publishText: string;
  public loading = true;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: 'Submission Title',
      value: 'title',
      width: 'col-3'
    },
    {
      name: 'Requirements',
      value: 'requirement',
      width: 'col-4'
    },
    {
      name: 'Description',
      value: 'description',
      width: 'col-4'
    },
    {
      name: 'Assets',
      value: '',
      width: 'col-1'
    }
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
    if (this.storageService.state.selectedInspection == null) {
      this.router.navigate(['/']);
    }
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.compliance = res.compliance.data;
        this.elements = this.compliance.elements;
        this.tableParams.totalListItems = this.elements.length;
        this.tableParams.currentPage = 1;
        this.tableParams.pageSize = 100000;
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  setRowData() {
    if (this.elements && this.elements.length > 0) {
      this.tableData = new TableObject(
        ElementTableRowsComponent,
        this.elements,
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
