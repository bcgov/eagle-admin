import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, forkJoin, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { SearchTerms } from 'src/app/models/search';
import { ApiService } from 'src/app/services/api';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableDocumentParamsObject } from 'src/app/shared/components/table-template/table-document-params-object';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { Constants } from 'src/app/shared/utils/constants';
import { TableDocumentTemplateUtils } from 'src/app/shared/utils/table-document-template-utils';
import { Utils } from 'src/app/shared/utils/utils';
import { DocumentTableRowsComponent } from './project-document-table-rows/project-document-table-rows.component';
import { Document } from 'src/app/models/document';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';


class DocumentFilterObject {
  constructor(
    public milestone: Array<string> = [],
    public datePostedStart: object = {},
    public datePostedEnd: object = {},
    public type: Array<string> = [],
    public documentAuthorType: Array<string> = [],
    public projectPhase: Array<string> = []
  ) { }
}

@Component({
  selector: 'app-project-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbDropdownModule,
    TableTemplateComponent
  ],
  templateUrl: './project-documents.component.html',
  styleUrls: ['./project-documents.component.css'],
  providers: [TableDocumentTemplateUtils]
})
export class ProjectDocumentsComponent implements OnInit, OnDestroy {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private api = inject(ApiService);
  private modalService = inject(NgbModal);
  private documentService = inject(DocumentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private searchService = inject(SearchService);
  private configService = inject(ConfigService);
  private storageService = inject(StorageService);
  private tableDocumentTemplateUtils = inject(TableDocumentTemplateUtils);
  private utils = inject(Utils);

  // Must do this to expose the constants to the template,
  public readonly constants = Constants;

  private activeLegislationYear: number;

  public categorizedDocsCount = 0;
  public categorizedDocs: Document[] = [];

  public milestones: any[] = [];
  public authors: any[] = [];
  public types: any[] = [];
  public projectPhases: any[] = [];
  public legislations: any[] = [];

  public loading = true;

  public tableParams: TableDocumentParamsObject = new TableDocumentParamsObject();
  public terms = new SearchTerms();

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public filterForUI: DocumentFilterObject = new DocumentFilterObject();

  public showAdvancedSearch = true;

  public currentTab = Constants.documentTypes.CATEGORIZED;

  public showFilters = {
    milestone: false,
    date: false,
    documentAuthorType: false,
    projectPhase: false,
    type: false
  };

  public numFilters = {
    milestone: 0,
    date: 0,
    documentAuthorType: 0,
    projectPhase: 0,
    type: 0
  };

  public categorizedDocumentTableData: TableObject;
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
      width: '30%'
    },
    {
      name: 'Status',
      value: 'status',
      width: '7%'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: '14%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '14%'
    },
    {
      name: 'Milestone',
      value: 'milestone',
      width: '14%'
    },
    {
      name: 'Legislation',
      value: 'legislation',
      width: '10%'
    },
    {
      name: 'Feature',
      value: 'isFeatured',
      width: '6%'
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

  ngOnInit() {
    if (this.milestones.length === 0) {
      const milestones = this.configService.lists.filter(item => item.type === 'label');
      this.milestones = milestones.slice().sort((a, b) => {
        if (a.legislation < b.legislation) return -1;
        if (a.legislation > b.legislation) return 1;
        return 0;
      });
    }

    if (this.authors.length === 0) {
      const authors = this.configService.lists.filter(item => item.type === 'author');
      this.authors = authors.slice().sort((a, b) => {
        if (a.legislation < b.legislation) return -1;
        if (a.legislation > b.legislation) return 1;
        return 0;
      });
    }

    if (this.types.length === 0) {
      const types = this.configService.lists.filter(item => item.type === 'doctype');
      this.types = types.slice().sort((a, b) => {
        if (a.legislation < b.legislation) return -1;
        if (a.legislation > b.legislation) return 1;
        if (a.listOrder < b.listOrder) return -1;
        if (a.listOrder > b.listOrder) return 1;
        return 0;
      });
    }

    if (this.projectPhases.length === 0) {
      const projectPhases = this.configService.lists.filter(item => item.type === 'projectPhase');
      this.projectPhases = projectPhases.slice().sort((a, b) => {
        if (a.legislation < b.legislation) return -1;
        if (a.legislation > b.legislation) return 1;
        return 0;
      });
    }
    this.subscriptions.add(
      this.route.params
        .pipe(
          switchMap((res: any) => {
            const params = { ...res };

            this.setFiltersFromParams(params);

            this.updateCounts();

            if (this.storageService.state.projectDocumentTableParams == null) {
              this.tableParams = this.tableDocumentTemplateUtils.getParamsFromUrl(
                params,
                this.filterForURL
              );

              if (this.tableParams.sortByCategorized === '') {
                this.tableParams.sortByCategorized = '-datePosted,+displayName';
              }

              if (params.keywords !== undefined) {
                this.tableParams.keywords =
                  decodeURIComponent(params.keywords) || '';
              } else {
                this.tableParams.keywords = '';
              }

              this.storageService.state.projectDocumentTableParams = this.tableParams;
              this._changeDetectionRef.detectChanges();
            } else {
              this.tableParams = this.storageService.state.projectDocumentTableParams;
              this.tableParams.keywords = decodeURIComponent(
                this.tableParams.keywords
              );
            }

            this.currentProject = this.storageService.state.currentProject.data;
            this.storageService.state.labels = null;
            this._changeDetectionRef.detectChanges();

            return this.route.data;
          })
        )
        .subscribe(({ documents }: any) => {
          if (documents.categorized) {
            if (documents.categorized.data && documents.categorized.data.meta.length > 0) {
              this.tableParams.totalListItemsCategorized = documents.categorized.data.meta[0].searchResultsTotal;
              this.categorizedDocs = documents.categorized.data.searchResults;
            } else {
              this.tableParams.totalListItemsCategorized = 0;
              this.categorizedDocs = [];
            }

            this.setRowData();

            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load valued components');
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

        if (this.categorizedDocumentTableData) {
          this.categorizedDocumentTableData.data.map(item => {
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

        if (this.categorizedDocumentTableData && this.currentTab === Constants.documentTypes.CATEGORIZED) {
          this.categorizedDocumentTableData.data.map(item => {
            if (item.checkbox === true) {
              someSelected = true;
            }
          });
          this.categorizedDocumentTableData.data.map(item => {
            item.checkbox = !someSelected;
          });
        }

        this.selectedCount.total = someSelected
          ? 0
          : this.categorizedDocumentTableData.data.length;

        this.setPublishUnpublish();

        this._changeDetectionRef.detectChanges();
        break;
      case 'edit':
        const selectedDocs = [];

        if (this.categorizedDocumentTableData) {
          this.categorizedDocumentTableData.data.map(item => {
            if (item.checkbox === true) {
              selectedDocs.push(
                this.categorizedDocs.filter(d => d._id === item._id)[0]
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
          'p',
          this.currentProject._id,
          'project-documents',
          'edit'
        ]);
        break;
      case 'delete':
        this.deleteDocument();
        break;
      case 'download':
        if (this.categorizedDocumentTableData && this.currentTab === Constants.documentTypes.CATEGORIZED) {
          this.categorizedDocumentTableData.data.map(item => {
            if (item.checkbox === true) {
              promises.push(
                this.api.downloadDocument(
                  this.categorizedDocs.filter(d => d._id === item._id)[0]
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

  public publishDocument() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static', // Prevent closing when clicking outside the modal
      centered: true, // Center the modal on the screen
    });
    modalRef.componentInstance.title = 'Publish Document(s)';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to publish the selected Documents or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false; // Set okOnly to false for both OK and Cancel buttons

    modalRef.result.then((isConfirmed) => {
      if (isConfirmed) {
        this.loading = true;
        const observables = [];

        if (this.categorizedDocumentTableData) {
          this.categorizedDocumentTableData.data.map(item => {
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
    }).catch(() => {
      // Handle error
    });
  }

  public unpublishDocument() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static', // Prevent closing when clicking outside
      centered: true, // Center the modal
    });
    modalRef.componentInstance.title = 'Unpublish Document(s)';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to unpublish the selected Documents or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result.then((isConfirmed) => {
      if (isConfirmed) {
        this.loading = true;
        const observables = [];

        if (this.categorizedDocumentTableData) {
          this.categorizedDocumentTableData.data.map(item => {
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
    }).catch(() => {
      // Handle error
    });
  }

  public deleteDocument() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static', // Prevent closing when clicking outside
      centered: true, // Center the modal
    });
    modalRef.componentInstance.title = 'Delete Document';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to delete this Document or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result.then(async (isConfirmed) => {
      if (isConfirmed) {
        this.loading = true;
        const itemsToDelete = [];

        if (this.categorizedDocumentTableData) {
          this.categorizedDocumentTableData.data.map(item => {
            if (item.checkbox === true) {
              itemsToDelete.push({
                promise: firstValueFrom(this.documentService.delete(item)),
                item: item
              });
            }
          });
        }

        this.loading = false;

        return Promise.all(itemsToDelete.map(i => i.promise)).then(() => {
          this.onSubmit(); // Reload main page
        });
      }
    }).catch(() => {
      // Handle error
    });
  }

  public onNumItems(numItems) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPageCategorized'] = this.tableParams.currentPageCategorized = 1;
    params['sortByCategorized'] = this.tableParams.sortByCategorized;
    params['keywords'] = this.tableParams.keywords;

    if (numItems === 'max') {
      params['pageSizeCategorized'] = this.tableParams.totalListItemsCategorized;
    } else {
      params['pageSizeCategorized'] = this.tableParams.pageSizeCategorized = numItems;
    }

    this.router.navigate([
      'p',
      this.currentProject._id,
      'project-documents',
      params
    ]);
  }

  public onSubmit() {
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    this.loading = true;

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPageCategorized'] = this.tableParams.currentPageCategorized = 1;
    params['sortByCategorized'] = this.tableParams.sortByCategorized = '-datePosted,+displayName';
    params['keywords'] = this.utils.encodeParams(
      (this.tableParams.keywords = this.tableParams.keywords || '')
    );
    params['pageSizeCategorized'] = this.tableParams.pageSizeCategorized;

    this.setParamsFromFilters(params);

    this.router.navigate([
      'p',
      this.currentProject._id,
      'project-documents',
      params
    ]);
  }

  setRowData() {
    if (this.categorizedDocs && this.categorizedDocs.length > 0) {
      const documentList: any[] = [];

      this.categorizedDocs.forEach(document => {
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

      this.categorizedDocumentTableData = new TableObject(
        DocumentTableRowsComponent,
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
    this.selectedCount.total = this.selectedCount[Constants.documentTypes.CATEGORIZED];
    this.setPublishUnpublish();
  }

  setPublishUnpublish() {
    this.canPublish = false;
    this.canUnpublish = false;

    for (const document of this.categorizedDocumentTableData.data) {
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

  paramsToCollectionFilters(params, name, collection, identifyBy) {
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name] && collection) {
      const confirmedValues = [];
      // look up each value in collection
      const values = params[name].split(',');
      values.forEach(value => {
        const record = collection.find(item => item[identifyBy] === value);
        if (record) {
          confirmedValues.push(value);
        }
      });
      if (confirmedValues.length) {
        this.filterForURL[name] = confirmedValues.join(',');
        this.filterForAPI[name] = confirmedValues.join(',');
      }
    }
  }

  paramsToDateFilters(params, name) {
    this.filterForUI[name] = null;
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];
      this.filterForAPI[name] = params[name];
      // NGB Date
      const date = DateTime.fromISO(params[name]).toJSDate();
      this.filterForUI[name] = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
  }

  setFiltersFromParams(params) {
    this.paramsToCollectionFilters(params, 'milestone', this.milestones, '_id');
    this.paramsToCollectionFilters(params, 'documentAuthorType', this.authors, '_id');
    this.paramsToCollectionFilters(params, 'type', this.types, '_id');
    this.paramsToCollectionFilters(params, 'projectPhase', this.projectPhases, '_id');

    this.paramsToDateFilters(params, 'datePostedStart');
    this.paramsToDateFilters(params, 'datePostedEnd');
  }

  collectionFilterToParams(params, name, identifyBy) {
    if (this.filterForUI[name].length) {
      const values = this.filterForUI[name].map(record => {
        return record[identifyBy];
      });
      params[name] = values.join(',');
    }
  }

  isNGBDate(date) {
    return date && date.year && date.month && date.day;
  }

  dateFilterToParams(params, name) {
    if (this.isNGBDate(this.filterForUI[name])) {
      const date = new Date(
        this.filterForUI[name].year,
        this.filterForUI[name].month - 1,
        this.filterForUI[name].day
      );
      params[name] = DateTime.fromJSDate(date).toISODate();
    }
  }

  setParamsFromFilters(params) {
    this.collectionFilterToParams(params, 'milestone', '_id');
    this.collectionFilterToParams(params, 'documentAuthorType', '_id');
    this.collectionFilterToParams(params, 'type', '_id');
    this.collectionFilterToParams(params, 'projectPhase', '_id');

    this.dateFilterToParams(params, 'datePostedStart');
    this.dateFilterToParams(params, 'datePostedEnd');
  }

  toggleFilter(name) {
    if (this.showFilters[name]) {
      this.updateCount(name);
      this.showFilters[name] = false;
    } else {
      Object.keys(this.showFilters).forEach(key => {
        if (this.showFilters[key]) {
          this.updateCount(key);
          this.showFilters[key] = false;
        }
      });
      this.showFilters[name] = true;
    }
  }

  isShowingFilter() {
    return Object.keys(this.showFilters).some(key => {
      return this.showFilters[key];
    });
  }

  clearAll() {
    Object.keys(this.filterForUI).forEach(key => {
      if (this.filterForUI[key]) {
        if (Array.isArray(this.filterForUI[key])) {
          this.filterForUI[key] = [];
        } else if (typeof this.filterForUI[key] === 'object') {
          this.filterForUI[key] = {};
        } else {
          this.filterForUI[key] = '';
        }
      }
    });
    this.updateCounts();
  }

  updateCount(name) {
    const getCount = n => {
      return Object.keys(this.filterForUI[n]).filter(
        k => this.filterForUI[n][k]
      ).length;
    };

    let num = 0;
    if (name === 'date') {
      num += this.isNGBDate(this.filterForUI.datePostedStart) ? 1 : 0;
      num += this.isNGBDate(this.filterForUI.datePostedEnd) ? 1 : 0;
    } else {
      num = getCount(name);
    }
    this.numFilters[name] = num;
  }

  updateCounts() {
    this.updateCount('milestone');
    this.updateCount('date');
    this.updateCount('documentAuthorType');
    this.updateCount('type');
    this.updateCount('projectPhase');
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

    if (docType === Constants.documentTypes.CATEGORIZED) {
      this.tableParams.pageSizeCategorized = this.categorizedDocumentTableData ? this.categorizedDocumentTableData.paginationData.pageSize : 0;
      this.subscriptions.add(
        this.searchService
          .getSearchResults(
            this.tableParams.keywords || '',
            'Document',
            [
              { name: 'project', value: this.currentProject._id },
              { name: 'categorized', value: true }
            ],
            pageNumber,
            this.categorizedDocumentTableData.paginationData.pageSize,
            this.tableParams.sortByCategorized,
            { documentSource: 'PROJECT' },
            true,
            this.filterForAPI,
            ''
          )
          .subscribe((res: any) => {
            this.tableParams.totalListItemsCategorized = res[0].data.meta[0].searchResultsTotal;
            this.categorizedDocs = res[0].data.searchResults;
            this.tableDocumentTemplateUtils.updateUrl(
              this.tableParams.sortByCategorized,
              this.tableParams.currentPageCategorized,
              this.categorizedDocumentTableData ? this.categorizedDocumentTableData.paginationData.pageSize : 0,
              this.filterForURL,
              this.tableParams.keywords || ''
            );

            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          })
      );
    }
  }

  // Compares selected options when a dropdown is grouped by legislation.
  compareDropdownOptions(optionA: any, optionB: any) {
    if ((optionA.name === optionB.name) && (optionA.legislation === optionB.legislation)) {
      return true;
    }

    return false;
  }

  clearSelectedItem(filter: string, item: any) {
    this.filterForUI[filter] = this.filterForUI[filter].filter(option => option._id !== item._id);
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

  /**
   * Groups documents into categorized.
   *
   * @param documents Array of documents.
   */
  public groupDocuments(documents: any[]): void {
    documents.forEach(document => {
      if (document.milestone && document.documentType && document.documentAuthorType) {
        this.categorizedDocs.push(document);
      }
    });
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
      this.tableParams.pageSizeCategorized = this.tableParams.totalListItemsCategorized;
    }

    this.onSubmit();
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
