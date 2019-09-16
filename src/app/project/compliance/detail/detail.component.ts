import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { Compliance } from 'app/models/compliance';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';
import { MatSnackBar } from '@angular/material';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { ComplianceTableRowsComponent } from '../compliance-table-rows/compliance-table-rows.component';

@Component({
  selector: 'app-compliance-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class ComplianceDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Compliance = null;
  public currentProject: Project = null;
  public compliances: Compliance[] = null;
  public publishText: string;
  public loading = true;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: 'Title',
      value: 'title',
      width: 'col-2'
    },
    {
      name: 'Requirement',
      value: 'requirement',
      width: 'col-3'
    },
    {
      name: 'Description',
      value: 'startDate',
      width: 'col-4'
    },
    {
      name: 'Assets',
      value: 'endDate',
      width: 'col-1'
    },
    {
      name: 'Date Submitted',
      value: 'actions',
      width: 'col-2',
      nosort: true
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
  ) {
  }

  async ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.document = res.compliance.data;
        console.log('this.document:', this.document);
      });
  }

  setRowData() {
    let documentList = [];
    if (this.compliances && this.compliances.length > 0) {
      this.compliances.forEach(item => {
        documentList.push(
          {
            _id: item._id,
            name: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
            project: item.project,
            email: item.email,
            case: item.case,
            label: item.label,
            elements: item.elements
          }
        );
      });
      this.tableData = new TableObject(
        ComplianceTableRowsComponent,
        documentList,
        this.tableParams
      );
    }
  }
  download(item) {
    // console.log('Package Download?:', item);
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
