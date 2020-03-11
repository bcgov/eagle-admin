import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject, forkJoin } from 'rxjs';
import * as _ from 'lodash';
import { Document } from 'app/models/document';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';
import { PnDocumentTableRowsComponent } from './project-notification-document-table-rows/project-notification-document-table-rows.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableDocumentParamsObject } from 'app/shared/components/table-template/table-document-params-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableDocumentTemplateUtils } from 'app/shared/utils/table-document-template-utils';
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
      width: 'col-4'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: 'col-1'
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
    private searchService: SearchService,
    private storageService:  StorageService,
    private tableDocumentTemplateUtils: TableDocumentTemplateUtils,
    private utils: Utils
  ) {}

  ngOnInit() {
    this.route.parent.data
      .switchMap(parentData => {
        return this.route.params;
      })
      .switchMap((res: any) => {
        let params = { ...res };

        this.currentProject = this.storageService.state.currentProject;
        this._changeDetectionRef.detectChanges();

        return this.route.data;
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(({ documents }: any) => {
        if (documents) {
          if (documents.data && documents.data.meta.length > 0) {
            this.tableParams.totalListItemsCategorized = documents.data.meta[0].searchResultsTotal;
            this.docs = documents.data.searchResults;
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
      case 'edit':
        const selectedDocs = [];

        if (this.documentTableData) {
          this.documentTableData.data.map(item => {
            if (item.checkbox === true) {
              selectedDocs.push(
                this.docs.filter(d => d._id === item._id)[0]
              );
            }
          });
        }

        // Store and send to the edit page.
        this.storageService.state.selectedDocs = selectedDocs;
        // Set labels if doc size === 1
        if (selectedDocs.length === 1) {
          this.storageService.state.labels = selectedDocs[0].labels;
        }

        this.router.navigate([
          'pn',
          this.currentProject._id,
          'project-notification-documents',
          'edit'
        ]);
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
            res => {},
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
            res => {},
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

  public onNumItems(numItems) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = {};
    params['ms'] = new Date().getMilliseconds();

    this.router.navigate([
      'p',
      this.currentProject._id,
      'project-documents',
      params
    ]);
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    this.loading = true;

    const params = {};
    params['ms'] = new Date().getMilliseconds();

    this.router.navigate([
      'p',
      this.currentProject._id,
      'project-documents',
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
          datePosted: document.datePosted,
          status: document.read.includes('public')
            ? 'Published'
            : 'Not Published',
          type: document.type,
          milestone: document.milestone,
          legislation: document.legislation,
          _id: document._id,
          project: document.project,
          read: document.read,
          isFeatured: document.isFeatured,
          sortOrder: document.sortOrder,
          publicHitCount: document.publicHitCount,
          secureHitCount: document.secureHitCount
        });
      });

      const categorizedTableParams: TableParamsObject = new TableParamsObject(
        this.tableParams.pageSizeCategorized,
        this.tableParams.currentPageCategorized,
        this.tableParams.totalListItemsCategorized,
        this.tableParams.sortByCategorized,
        this.tableParams.keywords,
        this.tableParams.filter
      );

      this.documentTableData = new TableObject(
        PnDocumentTableRowsComponent,
        documentList,
        categorizedTableParams,
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

    this.getPaginatedDocs(docType, currentPage);
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

  updateSelectedRow(documentType, changeEvent) {
    this.activeLegislationYear = changeEvent.activeLegislationYear;
    this.selectedCount[documentType] = changeEvent.count;
    // Accessing on a keyed index so that the constants can be used.
    this.selectedCount.total = this.selectedCount[Constants.documentTypes.CATEGORIZED] + this.selectedCount[Constants.documentTypes.UNCATEGORIZED];
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

  getPaginatedDocs(docType, pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableDocumentTemplateUtils.updateTableParams(
      docType,
      this.tableParams,
      pageNumber,
    );

    this.tableParams.pageSizeCategorized = this.documentTableData.paginationData.pageSize;
    this.searchService
    .getSearchResults(
      this.tableParams.keywords || '',
      'Document',
      [
        { name: 'project', value: this.currentProject._id },
        { name: 'categorized', value: true }
      ],
      pageNumber,
      this.documentTableData.paginationData.pageSize,
      this.tableParams.sortByCategorized,
      { documentSource: 'PROJECT-NOTIFICATIONS' },
      true,
      this.filterForAPI,
      ''
    )
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      this.tableParams.totalListItemsCategorized = res[0].data.meta[0].searchResultsTotal;
      this.docs = res[0].data.searchResults;
      this.tableDocumentTemplateUtils.updateUrl(
        this.tableParams.sortByCategorized,
        this.tableParams.sortByUncategorized,
        this.tableParams.currentPageCategorized,
        this.tableParams.currentPageUncategorized,
        this.documentTableData.paginationData.pageSize,
        null,
        this.filterForURL,
        this.tableParams.keywords || ''
      );

      this.setRowData();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
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
