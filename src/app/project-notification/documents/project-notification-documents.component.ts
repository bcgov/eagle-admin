import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject, forkJoin } from 'rxjs';
import * as _ from 'lodash';
import { Document } from 'app/models/document';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';
import { PnDocumentTableRowsComponent } from './project-notification-document-table-rows/project-notification-document-table-rows.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableDocumentParamsObject } from 'app/shared/components/table-template/table-document-params-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { Utils } from 'app/shared/utils/utils';
import { Constants } from 'app/shared/utils/constants';

@Component({
  selector: 'app-project-notification-documents',
  templateUrl: './project-notification-documents.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./project-notification-documents.component.scss']
})
export class ProjectNotificationDocumentsComponent implements OnInit, OnDestroy {
  // Must do this to expose the constants to the template,
  public readonly constants = Constants;

  private activeLegislationYear: number;

  public docsCount = 0;
  public docs: Document[] = [];

  public loading = true;

  public tableParams: TableDocumentParamsObject = new TableDocumentParamsObject();

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: 'select_all_box',
      value: 'select_all_box',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-11',
      nosort: true
    }
  ];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public selectedCount = {
    categorized: 0,
    uncategorized: 0,
    total: 0,
  };
  public currentProject;
  public canPublish;
  public canUnpublish;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService,
    private dialogService: DialogService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService:  StorageService,
    private utils: Utils
  ) {
    this.activeLegislationYear = 2018;
  }

  ngOnInit() {
    this.route.parent.data
      .switchMap(() => {
        return this.route.params;
      })
      .switchMap(() => {
        this.currentProject = this.storageService.state.currentProject.data;
        this._changeDetectionRef.detectChanges();

        return this.route.data;
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(({ documents }: any) => {
        if (documents) {
          if (documents[0].data && documents[0].data.meta.length > 0) {
            this.tableParams.totalListItemsCategorized = documents[0].data.meta[0].searchResultsTotal;
            this.docs = documents[0].data.searchResults;
          } else {
            this.tableParams.totalListItemsCategorized = 0;
            this.docs = [];
          }

          this.setRowData();

          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load documents');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      verticalPosition: 'top',
      horizontalPosition: 'center',
      duration: 4000
    });
  }

  public selectAction(action) {
    let promises = [];

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
    this.dialogService
      .addDialog(
        ConfirmComponent,
        {
          title: 'Publish Document(s)',
          message:
            'Click <strong>OK</strong> to publish the selected Documents or <strong>Cancel</strong> to return to the list.',
            okOnly: false,
        },
        {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        }
      )
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isConfirmed => {
        if (isConfirmed) {
          this.loading = true;
          let observables = [];

          if (this.documentTableData) {
            this.documentTableData.data.map(item => {
              if (item.checkbox && !item.read.includes('public')) {
                observables.push(this.documentService.publish(item._id));
              }
            });
          }

          forkJoin(observables).subscribe(
            () => {},
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
      });
  }

  unpublishDocument() {
    this.dialogService
      .addDialog(
        ConfirmComponent,
        {
          title: 'Unpublish Document(s)',
          message:
            'Click <strong>OK</strong> to unpublish the selected Documents or <strong>Cancel</strong> to return to the list.',
          okOnly: false,
        },
        {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        }
      )
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isConfirmed => {
        if (isConfirmed) {
          this.loading = true;
          let observables = [];

          if (this.documentTableData) {
            this.documentTableData.data.map(item => {
              if (item.checkbox && item.read.includes('public')) {
                observables.push(this.documentService.unPublish(item._id));
              }
            });
          }

          forkJoin(observables).subscribe(
            () => {},
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
      });
  }

  deleteDocument() {
    this.dialogService
      .addDialog(
        ConfirmComponent,
        {
          title: 'Delete Document',
          message:
            'Click <strong>OK</strong> to delete this Document or <strong>Cancel</strong> to return to the list.',
          okOnly: false,
        },
        {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        }
      )
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isConfirmed => {
        if (isConfirmed) {
          this.loading = true;
          // Delete the Document(s)
          const itemsToDelete = [];

          if (this.documentTableData) {
            this.documentTableData.data.map(item => {
              if (item.checkbox === true) {
                itemsToDelete.push({
                  promise: this.documentService.delete(item).toPromise(),
                  item: item
                });
              }
            });
          }

          this.loading = false;

          return Promise.all(itemsToDelete).then(() => {
            // Reload main page.
            this.onSubmit();
          });
        }
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

    this.router.navigate([
      'pn',
      this.currentProject._id,
      'project-notification-documents',
      params
    ]);
  }

  setRowData() {
    if (this.docs && this.docs.length > 0) {
      const documentList: any[] = [];

      this.docs.forEach(document => {
        documentList.push({
          displayName: document.displayName,
          documentFileName: document.documentFileName,
          datePosted: new Date(),
          status: '',
          type: '',
          milestone: '',
          legislation: 2018,
          _id: document._id,
          project: document.project,
          read: document.read,
          isFeatured: false,
          sortOrder: 0,
          publicHitCount: document.publicHitCount,
          secureHitCount: document.secureHitCount
        });
      });

      const tableParams: TableParamsObject = new TableParamsObject(
        2,
        1,
        2,
        '',
        '',
        ''
      );

      this.documentTableData = new TableObject(
        PnDocumentTableRowsComponent,
        documentList,
        tableParams,
        this.activeLegislationYear,
      );
    }
  }

  setColumnSort(docType, column) {
    let currentPage;

    if (docType === Constants.documentTypes.CATEGORIZED) {
      currentPage = this.tableParams.currentPageCategorized;

      if (this.tableParams.sortByCategorized.charAt(0) === '+') {
        this.tableParams.sortByCategorized = '-' + column;
      } else {
        this.tableParams.sortByCategorized = '+' + column;
      }
    } else if (docType === Constants.documentTypes.UNCATEGORIZED) {
      currentPage = this.tableParams.currentPageUncategorized;

      if (this.tableParams.sortByUncategorized.charAt(0) === '+') {
        this.tableParams.sortByUncategorized = '-' + column;
      } else {
        this.tableParams.sortByUncategorized = '+' + column;
      }
    }
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
    let selBox = document.createElement('textarea');
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

  public onPageLimitClick(pageLimit: number | string) {
    if (pageLimit === 'all') {
      this.tableParams.pageSizeCategorized = Math.max(this.tableParams.totalListItemsCategorized, this.tableParams.totalListItemsUncategorized);
    } else {
      this.tableParams.pageSizeUncategorized = pageLimit as number;
    }

    this.onSubmit();
  }

  public onTabChange(_event) {
    if (this.documentTableData) {
      this.documentTableData.extraData = this.activeLegislationYear;
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
