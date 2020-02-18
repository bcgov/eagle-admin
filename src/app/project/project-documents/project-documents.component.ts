import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { DialogService } from 'ng2-bootstrap-modal';
import { Subject, forkJoin } from 'rxjs';

import * as moment from 'moment';
import * as _ from 'lodash';

import { Document } from 'app/models/document';
import { SearchTerms } from 'app/models/search';

import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

import { DocumentTableRowsComponent } from './project-document-table-rows/project-document-table-rows.component';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableDocumentParamsObject } from 'app/shared/components/table-template/table-document-params-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableDocumentTemplateUtils } from 'app/shared/utils/table-document-template-utils';

import { Utils } from 'app/shared/utils/utils';
import { ConfigService } from 'app/services/config.service';
import { Constants } from 'app/shared/utils/constants';

class DocumentFilterObject {
  constructor(
    public milestone: Array<string> = [],
    public datePostedStart: object = {},
    public datePostedEnd: object = {},
    public type: Array<string> = [],
    public documentAuthorType: Array<string> = []
  ) {}
}

@Component({
  selector: 'app-project-documents',
  templateUrl: './project-documents.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./project-documents.component.scss']
})
export class ProjectDocumentsComponent implements OnInit, OnDestroy {
  // Must do this to expose the constants to the template,
  private readonly constants = Constants;

  private activeLegislationYear: number;

  public categorizedDocsCount = 0;
  public uncategorizedDocsCount = 0;
  public categorizedDocs: Document[] = [];
  public uncategorizedDocs: Document[] = [];

  public milestones: any[] = [];
  public authors: any[] = [];
  public types: any[] = [];
  public legislations: any[] = [];

  public loading = true;

  public tableParams: TableDocumentParamsObject = new TableDocumentParamsObject();
  public terms = new SearchTerms();

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public filterForUI: DocumentFilterObject = new DocumentFilterObject();

  public showAdvancedSearch = true;

  public showFilters: object = {
    milestone: false,
    date: false,
    documentAuthorType: false,
    type: false
  };

  public numFilters: object = {
    milestone: 0,
    date: 0,
    documentAuthorType: 0,
    type: 0
  };

  public categorizedDocumentTableData: TableObject;
  public uncategorizedDocumentTableData: TableObject;
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
    },
    {
      name: 'Legislation',
      value: 'legislation',
      width: 'col-1'
    },
    {
      name: 'Feature',
      value: 'isFeatured',
      width: 'col-2'
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
    private configService:  ConfigService,
    private storageService:  StorageService,
    private tableDocumentTemplateUtils: TableDocumentTemplateUtils,
    private utils: Utils
  ) {}

  ngOnInit() {
    this.route.parent.data
      .switchMap(parentData => {
        const list = parentData.list;

        if (list.length > 0) {
          list.map(item => {
            switch (item.type) {
              case 'label':
                this.milestones.push({ ...item });
                break;
              case 'author':
                this.authors.push({ ...item });
                break;
              case 'doctype':
                this.types.push({ ...item });
                break;
              default:
                break;
            }
          });
        }

        // Sort by legislation.
        this.milestones = _.sortBy(this.milestones, ['legislation']);
        this.authors = _.sortBy(this.authors, ['legislation']);
        this.types = _.sortBy(this.types, ['legislation', 'listOrder']);

        return this.route.params;
      })
      .switchMap((res: any) => {
        let params = { ...res };

        this.setFiltersFromParams(params);

        this.updateCounts();

        if (this.storageService.state.projectDocumentTableParams == null) {
          this.tableParams = this.tableDocumentTemplateUtils.getParamsFromUrl(
            params,
            this.filterForURL
          );

          if (this.tableParams.sortByCategorized === '') {
            this.tableParams.sortByCategorized = '-datePosted';
          }

          if (this.tableParams.sortByUncategorized === '') {
            this.tableParams.sortByUncategorized = '-datePosted';
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
      .takeUntil(this.ngUnsubscribe)
      .subscribe(({ documents }: any) => {
        if (documents.categorized && documents.uncategorized) {
          if (documents.categorized.data && documents.categorized.data.meta.length > 0) {
            this.tableParams.totalListItemsCategorized = documents.categorized.data.meta[0].searchResultsTotal;
            this.categorizedDocs = documents.categorized.data.searchResults;
          } else {
            this.tableParams.totalListItemsCategorized = 0;
            this.categorizedDocs = [];
          }

          if (documents.uncategorized.data.meta && documents.uncategorized.data.meta.length > 0) {
            this.tableParams.totalListItemsUncategorized = documents.uncategorized.data.meta[0].searchResultsTotal;
            this.uncategorizedDocs = documents.uncategorized.data.searchResults;
          } else {
            this.tableParams.totalListItemsUncategorized = 0;
            this.uncategorizedDocs = [];
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
        this.categorizedDocumentTableData.data.map(item => {
          if (item.checkbox === true) {
            this.createRowCopy(item);
            this.openSnackBar(
              'A  PUBLIC  link to this document has been copied.',
              'Close'
            );
          }
        });

        this.uncategorizedDocumentTableData.data.map(item => {
          if (item.checkbox === true) {
            this.createRowCopy(item);
            this.openSnackBar(
              'A  PUBLIC  link to this document has been copied.',
              'Close'
            );
          }
        });
        break;
      case 'selectAll':
        let someSelected = false;
        this.categorizedDocumentTableData.data.map(item => {
          if (item.checkbox === true) {
            someSelected = true;
          }
        });
        this.categorizedDocumentTableData.data.map(item => {
          item.checkbox = !someSelected;
        });

        this.selectedCount.total = someSelected
          ? 0
          : this.categorizedDocumentTableData.data.length;

        this.setPublishUnpublish();

        this._changeDetectionRef.detectChanges();
        break;
      case 'edit':
        const selectedDocs = [];

        this.categorizedDocumentTableData.data.map(item => {
          if (item.checkbox === true) {
            selectedDocs.push(
              this.categorizedDocs.filter(d => d._id === item._id)[0]
            );
          }
        });

        this.uncategorizedDocumentTableData.data.map(item => {
          if (item.checkbox === true) {
            selectedDocs.push(
              this.uncategorizedDocs.filter(d => d._id === item._id)[0]
            );
          }
        });

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
        this.categorizedDocumentTableData.data.map(item => {
          if (item.checkbox === true) {
            promises.push(
              this.api.downloadDocument(
                this.categorizedDocs.filter(d => d._id === item._id)[0]
              )
            );
          }
        });

        this.uncategorizedDocumentTableData.data.map(item => {
          if (item.checkbox === true) {
            promises.push(
              this.api.downloadDocument(
                this.uncategorizedDocs.filter(d => d._id === item._id)[0]
              )
            );
          }
        });

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

          this.categorizedDocumentTableData.data.map(item => {
            if (item.checkbox && !item.read.includes('public')) {
              observables.push(this.documentService.publish(item._id));
            }
          });

          this.uncategorizedDocumentTableData.data.map(item => {
            if (item.checkbox && !item.read.includes('public')) {
              observables.push(this.documentService.publish(item._id));
            }
          });

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

          this.categorizedDocumentTableData.data.map(item => {
            if (item.checkbox && item.read.includes('public')) {
              observables.push(this.documentService.unPublish(item._id));
            }
          });

          this.uncategorizedDocumentTableData.data.map(item => {
            if (item.checkbox && item.read.includes('public')) {
              observables.push(this.documentService.unPublish(item._id));
            }
          });

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
          this.categorizedDocumentTableData.data.map(item => {
            if (item.checkbox === true) {
              itemsToDelete.push({
                promise: this.documentService.delete(item).toPromise(),
                item: item
              });
            }
          });

          this.uncategorizedDocumentTableData.data.map(item => {
            if (item.checkbox === true) {
              itemsToDelete.push({
                promise: this.documentService.delete(item).toPromise(),
                item: item
              });
            }
          });

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

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPageCategorized'] = this.tableParams.currentPageCategorized = 1;
    params['currentPageUncategorized'] = this.tableParams.currentPageUncategorized = 1;
    params['sortByCategorized'] = this.tableParams.sortByCategorized;
    params['sortByUncategorized'] = this.tableParams.sortByUncategorized;
    params['keywords'] = this.tableParams.keywords;

    if (numItems === 'max') {
      params['pageSize'] = this.tableParams.pageSize = Math.max(this.tableParams.totalListItemsCategorized, this.tableParams.totalListItemsUncategorized);
    } else {
      params['pageSize'] = this.tableParams.pageSize = numItems;
    }

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

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPageCategorized'] = this.tableParams.currentPageCategorized = 1;
    params['currentPageUncategorized'] = this.tableParams.currentPageUncategorized = 1;
    params['sortByCategorized'] = this.tableParams.sortByCategorized = '-datePosted';
    params['sortByUncategorized'] = this.tableParams.sortByUncategorized = '-datePosted';
    params['keywords'] = this.utils.encodeParams(
      (this.tableParams.keywords = this.tableParams.keywords || '')
    );
    params['pageSize'] = this.tableParams.pageSize;

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
          isFeatured: document.isFeatured
        });
      });

      const categorizedTableParams: TableParamsObject = new TableParamsObject(
        this.tableParams.pageSize,
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

    if (this.uncategorizedDocs && this.uncategorizedDocs.length > 0) {
      const documentList: any[] = [];

      this.uncategorizedDocs.forEach(document => {
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
          read: document.read
        });
      });

      const uncategorizedTableParams: TableParamsObject = new TableParamsObject(
        this.tableParams.pageSize,
        this.tableParams.currentPageUncategorized,
        this.tableParams.totalListItemsUncategorized,
        this.tableParams.sortByUncategorized,
        this.tableParams.keywords,
        this.tableParams.filter
      );

      this.uncategorizedDocumentTableData = new TableObject(
        DocumentTableRowsComponent,
        documentList,
        uncategorizedTableParams,
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
    console.log(this.activeLegislationYear);
    // Accessing on a keyed index so that the constants can be used.
    this.selectedCount.total = this.selectedCount[Constants.documentTypes.CATEGORIZED] + this.selectedCount[Constants.documentTypes.UNCATEGORIZED];
    this.setPublishUnpublish();
  }

  setPublishUnpublish() {
    this.canPublish = false;
    this.canUnpublish = false;

    for (let document of this.categorizedDocumentTableData.data) {
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

    for (let document of this.uncategorizedDocumentTableData.data) {
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
      let confirmedValues = [];
      // look up each value in collection
      const values = params[name].split(',');
      values.forEach(value => {
        const record = _.find(collection, [ identifyBy, value ]);
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
      const date = moment(params[name]).toDate();
      this.filterForUI[name] = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
  }

  setFiltersFromParams(params) {
    this.paramsToCollectionFilters(params, 'milestone', this.milestones, '_id');
    this.paramsToCollectionFilters(
      params,
      'documentAuthorType',
      this.authors,
      '_id'
    );
    this.paramsToCollectionFilters(params, 'type', this.types, '_id');

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
      params[name] = moment(date).format('YYYY-MM-DD');
    }
  }

  setParamsFromFilters(params) {
    this.collectionFilterToParams(params, 'milestone', '_id');
    this.collectionFilterToParams(params, 'documentAuthorType', '_id');
    this.collectionFilterToParams(params, 'type', '_id');

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
      this.searchService
      .getSearchResults(
        this.tableParams.keywords || '',
        'Document',
        [
          { name: 'project', value: this.currentProject._id },
          { name: 'categorized', value: true }
        ],
        pageNumber,
        this.tableParams.pageSize,
        this.tableParams.sortByCategorized,
        { documentSource: 'PROJECT' },
        true,
        this.filterForAPI,
        ''
      )
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItemsCategorized = res[0].data.meta[0].searchResultsTotal;
        this.categorizedDocs = res[0].data.searchResults;
        this.tableDocumentTemplateUtils.updateUrl(
          this.tableParams.sortByCategorized,
          this.tableParams.sortByUncategorized,
          this.tableParams.currentPageCategorized,
          this.tableParams.currentPageUncategorized,
          this.tableParams.pageSize,
          this.filterForURL,
          this.tableParams.keywords || ''
        );

        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
    } else if (docType === Constants.documentTypes.UNCATEGORIZED) {
      this.searchService
      .getSearchResults(
        this.tableParams.keywords || '',
        'Document',
        [
          { name: 'project', value: this.currentProject._id },
          { name: 'categorized', value: false }
        ],
        pageNumber,
        this.tableParams.pageSize,
        this.tableParams.sortByUncategorized,
        { documentSource: 'PROJECT' },
        true,
        this.filterForAPI,
        ''
      )
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItemsUncategorized = res[0].data.meta[0].searchResultsTotal;
        this.uncategorizedDocs = res[0].data.searchResults;
        this.tableDocumentTemplateUtils.updateUrl(
          this.tableParams.sortByCategorized,
          this.tableParams.sortByUncategorized,
          this.tableParams.currentPageCategorized,
          this.tableParams.currentPageUncategorized,
          this.tableParams.pageSize,
          this.filterForURL,
          this.tableParams.keywords || ''
        );

        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
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

  /**
   * Groups documents into categorized and uncategorized.
   *
   * @param documents Array of documents.
   */
  public groupDocuments(documents: any[]): void {
    documents.forEach(document => {
      if (!document.milestone || !document.documentType || !document.documentAuthorType) {
        this.uncategorizedDocs.push(document);
      } else {
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
      this.tableParams.pageSize = Math.max(this.tableParams.totalListItemsCategorized, this.tableParams.totalListItemsUncategorized);
    } else {
      this.tableParams.pageSize = pageLimit as number;
    }

    this.onSubmit();
  }

  public onTabChange(_event) {
    this.uncategorizedDocumentTableData.extraData = this.activeLegislationYear;
    this.categorizedDocumentTableData.extraData = this.activeLegislationYear;
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
