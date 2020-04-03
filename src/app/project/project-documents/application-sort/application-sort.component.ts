import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { SearchService } from 'app/services/search.service';
import { DocumentService } from 'app/services/document.service';
import { MatSnackBar } from '@angular/material';
import { Utils } from 'app/shared/utils/utils';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { ApplicationSortTableRowsComponent } from './application-sort-table-rows/application-sort-table-rows.component';
import { TableDocumentTemplateUtils } from 'app/shared/utils/table-document-template-utils';
import { User } from 'app/models/user';
import { Constants } from 'app/shared/utils/constants';
import { ConfigService } from 'app/services/config.service';




@Component({
  selector: 'app-application-sort',
  templateUrl: './application-sort.component.html',
  styleUrls: ['./application-sort.component.scss']
})
export class DocumentApplicationSortComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  // public document: Document = null;
  public currentProject: Project = null;
  // public publishText: string;
  // formatBytes: (bytes: any, decimals?: number) => string;
  public loading = true;
  public documents: User[] = null;
  public readonly constants = Constants;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: 'Order',
      value: 'sortOrder',
      width: 'col-1',
    },
    {
      name: 'Name',
      value: 'name',
      width: 'col-3'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-1'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Milestone',
      value: 'milestone',
      width: 'col-2'
    },
    {
      name: 'Legislation',
      value: 'legislation',
      width: 'col-1'
    }
  ];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private searchService: SearchService,
    private snackBar: MatSnackBar,
    private utils: Utils,
    private documentService: DocumentService,
    private tableTemplateUtils: TableTemplateUtils,
    private tableDocumentTemplateUtils: TableDocumentTemplateUtils,
    private configService: ConfigService
  ) {
  }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.editedDocs = [];

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '+sortOrder,-datePosted,+displayName';
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        this._changeDetectionRef.detectChanges();
      });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          if (res.documents && res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
            this.tableParams.totalListItems = res.documents[0].data.meta[0].searchResultsTotal;
            this.documents = res.documents[0].data.searchResults;
          } else {
            this.tableParams.totalListItems = 0;
            this.documents = [];
          }
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          this.openSnackBar('Uh-oh, couldn\'t load documents', 'Close');
          this.router.navigate(['/search']);
        }
      });
  }

  setRowData() {
    let list = [];
    if (this.documents && this.documents.length > 0) {
      this.documents.forEach((item: any) => {
        list.push(item);
      });
      this.tableData = new TableObject(
        ApplicationSortTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  updateSortOrder(document) {
    console.log(document);
  }

  onSave() {
    let formData = new FormData();
    let observables = [];
    this.storageService.state.editedDocs.forEach((document: any) =>  {
      console.log(document.sortOrder);
      // document service put id and sort order
      formData.set('sortOrder', document.sortOrder);
      this.documentService.update( formData, document._id )
      .takeUntil(this.ngUnsubscribe)
      .subscribe();
    });
    this.openSnackBar('Successfully updated sort order.', 'Close');
    this.router.navigate(['/p/' + this.currentProject._id + '/project-documents']);
  }

  onCancel() {
    this.router.navigate(['/p/' + this.currentProject._id + '/project-documents']);
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  getPaginatedDocs(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams.currentPage = pageNumber;

    const projectId = this.currentProject._id;
    const currentPage = pageNumber ? pageNumber : 1;
    const pageSize = this.tableData.paginationData.pageSize ? this.tableData.paginationData.pageSize : 10;
    const sortBy = this.tableParams.sortBy && this.tableParams.sortBy !== 'null' ? this.tableParams.sortBy : '+sortOrder,-datePosted,+displayName';
    const keywords = this.tableParams.keywords ? this.tableParams.keywords : '';

    this.configService.getLists().switchMap (list => {
      const tabModifier = this.utils.createProjectTabModifiers(Constants.documentTypes.APPLICATION, list);
      return this.searchService.getSearchResults(
        keywords,
        'Document',
        [{ 'name': 'project', 'value': projectId }],
        currentPage,
        pageSize,
        sortBy,
        tabModifier,
        true
      );
    })
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      if (res && res[0].data.meta && res[0].data.meta.length > 0) {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.documents = res[0].data.searchResults;
        // update values that have been edited previously
        this.documents.forEach((document: any) => {
          if (this.storageService.state.editedDocs && this.storageService.state.editedDocs.length > 0) {
            this.storageService.state.editedDocs.forEach((editedDocument: any) => {
              if (document._id === editedDocument._id) {
                document.sortOrder = editedDocument.sortOrder;
              }
            });
          }
        });
        this.tableTemplateUtils.updateUrl(
          sortBy,
          currentPage,
          pageSize,
          null,
          keywords
        );
        this.setRowData();
      } else {
        this.openSnackBar('Uh-oh, couldn\'t load documents', 'Close');
        this.tableParams.totalListItems = 0;
        this.documents = [];
      }
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
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
