import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ApiService } from 'src/app/services/api';
import { DocumentService } from 'src/app/services/document.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { Constants } from 'src/app/shared/utils/constants';
import { Utils } from 'src/app/shared/utils/utils';
import { PnDocumentTableRowsComponent } from './project-notification-document-table-rows/project-notification-document-table-rows.component';
import { Document } from 'src/app/models/document';

@Component({
    selector: 'app-project-notification-documents',
    templateUrl: './project-notification-documents.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./project-notification-documents.component.scss'],
    standalone: false
})
export class ProjectNotificationDocumentsComponent implements OnInit, OnDestroy {
  // Must do this to expose the constants to the template,
  public readonly constants = Constants;

  public docsCount = 0;
  public docs: Document[] = [];

  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: 'select_all_box',
      value: 'select_all_box',
      width: '5%',
      nosort: true
    },
    {
      name: 'Name',
      value: 'displayName',
      width: '30%',
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: '26%',
    },
    {
      name: 'Document Author',
      value: 'documentAuthor',
      width: '29%',
    },
    {
      name: 'status',
      value: 'status',
      width: '10%',
    }
  ];

  private subscriptions = new Subscription();

  public selectedCount = {
    categorized: 0,
    total: 0,
  };
  public currentProject;
  public canPublish;
  public canUnpublish;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService,
    private documentService: DocumentService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private utils: Utils
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.route.parent.data
        .subscribe((res: any) => {
          this.currentProject = this.storageService.state.currentProject?.data;
          if (!this.currentProject) {
            this.storageService.state.currentProject = res.notificationProject;
            this.currentProject = this.storageService.state.currentProject?.data;
          }

          if (res.documents) {
            if (res.documents[0].data && res.documents[0].data.meta.length > 0) {
              this.docs = res.documents[0].data.searchResults;
            } else {
              this.docs = [];
            }

            this.tableParams.sortBy = '-datePosted';
            this.tableParams.pageSize = 10;
            this.tableParams.currentPage = 1;
            this.tableParams.totalListItems = res.documents[0].data.meta[0] ? res.documents[0].data.meta[0].searchResultsTotal : 0;
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load documents');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        })
    );
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      verticalPosition: 'top',
      horizontalPosition: 'center',
      duration: 4000
    });
  }

  public selectAction(action) {
    const promises = [];

    // select all documents
    switch (action) {
      case 'copyLink':

        if (this.documentTableData) {
          this.documentTableData.data.map(item => {
            if (item.checkbox === true) {
              this.createRowCopy(item);
              this.openSnackBar(
                'A  PUBLIC  link to this document has been copied.',
                'Close'
              );
            }
          });
        }
        break;
      case 'selectAll':
        let someSelected = false;

        if (this.documentTableData) {
          this.documentTableData.data.map(item => {
            if (item.checkbox === true) {
              someSelected = true;
            }
          });
          this.documentTableData.data.map(item => {
            item.checkbox = !someSelected;
          });
        }

        this.selectedCount.total = someSelected
          ? 0
          : this.documentTableData.data.length;

        this.setPublishUnpublish();

        this._changeDetectionRef.detectChanges();
        break;
      case 'delete':
        this.deleteDocument();
        break;
      case 'download':
        if (this.documentTableData) {
          this.documentTableData.data.map(item => {
            if (item.checkbox === true) {
              promises.push(
                this.api.downloadDocument(
                  this.docs.filter(d => d._id === item._id)[0]
                )
              );
            }
          });
        }

        return Promise.all(promises).then(() => {
          console.log('Download initiated for file(s)');
        });
      case 'publish':
        this.publishDocument();
        break;
      case 'unpublish':
        this.unpublishDocument();
        break;
    }
  }

  navSearchHelp() {
    this.router.navigate(['/search-help']);
  }

  publishDocument() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
      backdropClass: 'custom-backdrop', // Optional: to replicate rgba look
    });

    modalRef.componentInstance.title = 'Publish Document(s)';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to publish the selected Documents or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.loading = true;
          const observables = [];

          if (this.documentTableData) {
            this.documentTableData.data.forEach(item => {
              if (item.checkbox && !item.read.includes('public')) {
                observables.push(this.documentService.publish(item._id));
              }
            });
          }

          forkJoin(observables).subscribe({
            error: err => {
              console.log('Error:', err);
            },
            complete: () => {
              this.loading = false;
              this.canUnpublish = false;
              this.canPublish = false;
              this.onSubmit();
            }
          });
        } else {
          this.loading = false;
        }
      })
      .catch(() => {
        // Modal dismissed
        this.loading = false;
      });
  }

  unpublishDocument() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
      backdropClass: 'custom-backdrop'
    });

    modalRef.componentInstance.title = 'Unpublish Document(s)';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to unpublish the selected Documents or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.loading = true;
          const observables = [];

          if (this.documentTableData) {
            this.documentTableData.data.forEach(item => {
              if (item.checkbox && item.read.includes('public')) {
                observables.push(this.documentService.unPublish(item._id));
              }
            });
          }

          forkJoin(observables).subscribe({
            error: err => {
              console.log('Error:', err);
            },
            complete: () => {
              this.loading = false;
              this.canUnpublish = false;
              this.canPublish = false;
              this.onSubmit();
            }
          });
        } else {
          this.loading = false;
        }
      })
      .catch(() => {
        // Modal dismissed
        this.loading = false;
      });
  }

  deleteDocument() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
      backdropClass: 'custom-backdrop'
    });

    modalRef.componentInstance.title = 'Delete Document';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to delete this Document or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result
      .then(async (isConfirmed) => {
        if (isConfirmed) {
          this.loading = true;
          const itemsToDelete = [];

          if (this.documentTableData) {
            this.documentTableData.data.forEach(item => {
              if (item.checkbox === true) {
                itemsToDelete.push(
                  this.documentService.delete(item).toPromise()
                );
              }
            });
          }

          try {
            await Promise.all(itemsToDelete);
          } catch (err) {
            console.log('Error deleting documents:', err);
          } finally {
            this.loading = false;
            this.onSubmit();
          }
        }
      })
      .catch(() => {
        // Modal dismissed
        this.loading = false;
      });
  }

  public onNumItems() {
    const params = {};
    params['ms'] = new Date().getMilliseconds();

    this.router.navigate([
      'pn',
      this.currentProject._id,
      'project-notification-documents',
      params
    ]);
  }

  public onSubmit() {
    this.loading = true;

    const params = {};
    params['ms'] = new Date().getMilliseconds();
    params['notificationProjectId'] = this.currentProject._id;

    this.router.navigate([
      'pn',
      this.currentProject._id,
      'project-notification-documents',
      params
    ]);
  }

  setRowData() {
    if (this.docs && this.docs.length > 0) {
      const documentList = this.docs.map((document) => {
        return {
          displayName: document.displayName,
          documentFileName: document.documentFileName,
          documentAuthor: document.documentAuthor,
          datePosted: document.datePosted,
          status: document['status'],
          type: '',
          milestone: '',
          legislation: 2018,
          _id: document._id,
          project: document.project,
          read: document.read,
          isFeatured: false,
          sortOrder: 0,
          publicHitCount: document.publicHitCount,
          secureHitCount: document.secureHitCount,
        };
      });

      this.documentTableData = new TableObject(
        PnDocumentTableRowsComponent,
        documentList,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {

    if (this.tableParams.sortBy[0] === '+') {
      this.tableParams.sortBy = `-${column}`;
    } else {
      this.tableParams.sortBy = `+${column}`;
    }

    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  getPaginatedDocs(page) {
    this.loading = true;
    this.tableParams.currentPage = page;

    // Use displayName as secondary sort if column has equal values
    const sortBy = this.tableParams.sortBy.substr(1) === 'displayName' ? this.tableParams.sortBy : `${this.tableParams.sortBy},+displayName`;

    this.subscriptions.add(
      this.searchService.getSearchResults(
        null,
        'Document',
        [],
        this.tableParams.currentPage,
        this.tableParams.pageSize,
        sortBy,
        { documentSource: 'PROJECT-NOTIFICATION', project: this.currentProject._id })
        .subscribe((res: any) => {
          this.docs = res[0].data.searchResults;
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;

          this.setRowData();

          this.loading = false;
          this._changeDetectionRef.detectChanges();
        })
    );
  }

  isEnabled(button) {
    switch (button) {
      case 'copyLink':
        return this.selectedCount.total === 1;
      case 'publish':
        return this.selectedCount.total > 0 && this.canPublish;
      case 'unpublish':
        return this.selectedCount.total > 0 && this.canUnpublish;
      default:
        return this.selectedCount.total > 0;
    }
  }

  updateSelectedRow(changeEvent) {
    // Accessing on a keyed index so that the constants can be used.
    this.selectedCount.total = changeEvent.count;
    this.setPublishUnpublish();
  }

  setPublishUnpublish() {
    this.canPublish = false;
    this.canUnpublish = false;

    for (const document of this.documentTableData.data) {
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

  isNGBDate(date) {
    return date && date.year && date.month && date.day;
  }

  // Compares selected options when a dropdown is grouped by legislation.
  compareDropdownOptions(optionA: any, optionB: any) {
    if ((optionA.name === optionB.name) && (optionA.legislation === optionB.legislation)) {
      return true;
    }

    return false;
  }

  private createRowCopy(item): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    const safeName = this.utils.encodeString(
      item.documentFileName,
      true
    );
    selBox.value =
      window.location.origin +
      `/api/document/${item._id}/fetch/${safeName}`;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  public filterCompareWith(filter: any, filterToCompare: any) {
    if (filter.hasOwnProperty('code')) {
      return filter && filterToCompare
        ? filter.code === filterToCompare.code
        : filter === filterToCompare;
    } else if (filter.hasOwnProperty('_id')) {
      return filter && filterToCompare
        ? filter._id === filterToCompare._id
        : filter === filterToCompare;
    }
  }

  public getResultTerm(count) {
    if (count === 1) {
      return 'result';
    } else {
      return 'results';
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
