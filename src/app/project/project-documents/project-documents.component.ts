import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DialogService } from 'ng2-bootstrap-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';

import { Document } from 'app/models/document';
import { SearchTerms } from 'app/models/search';

import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

import { DocumentTableRowsComponent } from './project-document-table-rows/project-document-table-rows.component';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-project-documents',
  templateUrl: './project-documents.component.html',
  styleUrls: ['./project-documents.component.scss']
})
export class ProjectDocumentsComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: Document[] = null;
  public loading = true;

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-6'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-1'
    },
    {
      name: 'Milestone',
      value: 'milestone',
      width: 'col-2'
    }
  ];

  public selectedCount = 0;

  public currentProject;
  public canPublish;
  public canUnpublish;

  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService,
    private dialogService: DialogService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    if (this.storageService.state.projectDocumentTableParams == null) {
      this.route.params
        .takeUntil(this.ngUnsubscribe)
        .subscribe(params => {
          if (params.keywords !== undefined) {
            this.tableParams.keywords = decodeURIComponent(params.keywords) || '';
          } else {
            this.tableParams.keywords = '';
          }
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '-datePosted';
          }
          this._changeDetectionRef.detectChanges();
        });
    } else {
      this.tableParams = this.storageService.state.projectDocumentTableParams;
      this.storageService.state.projectDocumentTableParams = null;
    }
    this.currentProject = this.storageService.state.currentProject.data;
    this._changeDetectionRef.detectChanges();

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          if (res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
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
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  public selectAction(action) {
    let promises = [];

    // select all documents
    switch (action) {
      case 'copyLink':
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            let selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            const safeName = item.documentFileName.replace(/ /g, '_');
            selBox.value = window.location.origin + `/api/document/${item._id}/fetch/${safeName}`;
            // selBox.value = window.location.origin + `/api/public/document/${item._id}/download`;
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);
            // alert('Item has been copied to the clipboard');
          }
        });
        break;
      case 'selectAll':
        let someSelected = false;
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
        });
        this.documentTableData.data.map((item) => {
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.documentTableData.data.length;

        this.setPublishUnpublish();

        this._changeDetectionRef.detectChanges();
        break;
      case 'edit':
        this.storageService.state.projectDocumentTableParams = this.tableParams;

        let selectedDocs = [];
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            selectedDocs.push(this.documents.filter(d => d._id === item._id)[0]);
          }
        });
        // Store and send to the edit page.
        this.storageService.state.selectedDocs = selectedDocs;
        // Set labels if doc size === 1
        if (selectedDocs.length === 1) {
          this.storageService.state.labels = selectedDocs[0].labels;
        }
        this.router.navigate(['p', this.currentProject._id, 'project-documents', 'edit']);
        break;
      case 'delete':
        this.deleteDocument();
        break;
      case 'download':
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            promises.push(this.api.downloadDocument(this.documents.filter(d => d._id === item._id)[0]));
          }
        });
        return Promise.all(promises).then(() => {
          console.log('Download initiated for file(s)');
        });
        break;
      case 'publish':
        this.publishDocument();
        break;
      case 'unpublish':
        this.unpublishDocument();
        break;
      case 'copyLink':
        break;
    }
  }

  navSearchHelp() {
    this.router.navigate(['/search-help']);
  }

  publishDocument() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Publish Document(s)',
        message: 'Click <strong>OK</strong> to publish the selected Documents or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.loading = true;
            let observables = [];
            this.documentTableData.data.map(item => {
              if (item.checkbox && !item.read.includes('public')) {
                observables.push(this.documentService.publish(item._id));
              }
            });
            forkJoin(observables)
              .subscribe(
                res => { },
                err => {
                  console.log('Error:', err);
                },
                () => {
                  this.loading = false;
                  this.canUnpublish = false;
                  this.canPublish = false;
                  this.onSubmit();
                }
              );
          } else {
            this.loading = false;
          }
        }
      );
  }

  unpublishDocument() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Unpublish Document(s)',
        message: 'Click <strong>OK</strong> to unpublish the selected Documents or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.loading = true;
            let observables = [];
            this.documentTableData.data.map(item => {
              if (item.checkbox && item.read.includes('public')) {
                observables.push(this.documentService.unPublish(item._id));
              }
            });
            forkJoin(observables)
              .subscribe(
                res => { },
                err => {
                  console.log('Error:', err);
                },
                () => {
                  this.loading = false;
                  this.canUnpublish = false;
                  this.canPublish = false;
                  this.onSubmit();
                }
              );
          } else {
            this.loading = false;
          }
        }
      );
  }

  deleteDocument() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Document',
        message: 'Click <strong>OK</strong> to delete this Document or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.loading = true;
            // Delete the Document(s)
            let itemsToDelete = [];
            this.documentTableData.data.map((item) => {
              if (item.checkbox === true) {
                itemsToDelete.push({ promise: this.documentService.delete(item).toPromise(), item: item });
              }
            });
            this.loading = false;
            return Promise.all(itemsToDelete).then(() => {
              // Reload main page.
              this.onSubmit();
            });
          }
          this.loading = false;
        }
      );
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const encode = encodeURIComponent;
    window['encodeURIComponent'] = (component: string) => {
      return encode(component).replace(/[!'()*]/g, (c) => {
        // Also encode !, ', (, ), and *
        return '%' + c.charCodeAt(0).toString(16);
      });
    };

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '-datePosted';
    params['keywords'] = encode(this.tableParams.keywords = this.tableParams.keywords || '').replace(/\(/g, '%28').replace(/\)/g, '%29');
    params['pageSize'] = this.tableParams.pageSize = 10;

    this.router.navigate(['p', this.currentProject._id, 'project-documents', params]);
  }

  setRowData() {
    let documentList = [];
    if (this.documents && this.documents.length > 0) {
      this.documents.forEach(document => {
        documentList.push(
          {
            displayName: document.displayName,
            documentFileName: document.documentFileName,
            datePosted: document.datePosted,
            status: document.read.includes('public') ? 'Published' : 'Not Published',
            type: document.type,
            milestone: document.milestone,
            _id: document._id,
            project: document.project,
            read: document.read
          }
        );
      });
      this.documentTableData = new TableObject(
        DocumentTableRowsComponent,
        documentList,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  isEnabled(button) {
    switch (button) {
      case 'copyLink':
        return this.selectedCount === 1;
        break;
      case 'publish':
        return this.selectedCount > 0 && this.canPublish;
        break;
      case 'unpublish':
        return this.selectedCount > 0 && this.canUnpublish;
        break;
      default:
        return this.selectedCount > 0;
        break;
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
    this.setPublishUnpublish();
  }

  setPublishUnpublish() {
    this.canPublish = false;
    this.canUnpublish = false;
    for (let document of this.documentTableData.data) {
      if (document.checkbox) {
        if (document.read.includes('public')) {
          this.canUnpublish = true;
        } else {
          this.canPublish = true;
        }
      }

      if (this.canPublish && this.canUnpublish) {
        return;
      }
    }
  }

  getPaginatedDocs(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.searchService.getSearchResults(
      this.tableParams.keywords || '',
      'Document',
      [{ 'name': 'project', 'value': this.currentProject._id }],
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      '[documentSource]=PROJECT',
      true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.documents = res[0].data.searchResults;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords || '');
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
