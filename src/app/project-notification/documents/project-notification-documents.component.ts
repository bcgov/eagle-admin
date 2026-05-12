import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, ViewEncapsulation, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { DocumentService } from 'src/app/services/document.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { Constants } from 'src/app/shared/utils/constants';
import { encodeString } from 'src/app/shared/utils/utils';
import { HttpCacheService } from 'src/app/interceptors/http-cache.interceptor';
import { PnDocumentTableRowsComponent } from './project-notification-document-table-rows/project-notification-document-table-rows.component';
import { Document } from 'src/app/models/document';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  selector: 'app-project-notification-documents',
  imports: [
    RouterModule,
    TableTemplateComponent,
    NgbDropdownModule,
    ReactiveFormsModule
  ],
  templateUrl: './project-notification-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './project-notification-documents.component.css',
})
export class ProjectNotificationDocumentsComponent implements OnInit {
  private documentService = inject(DocumentService);
  private modalService = inject(NgbModal);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  public readonly constants = Constants;

  private docs: Document[] = [];

  // Signals — OnPush tracks these automatically, no detectChanges() needed
  public loading = signal(true);
  public documentTableData = signal<TableObject | null>(null);
  public selectedCount = signal({ categorized: 0, total: 0 });
  public canPublish = signal(false);
  public canUnpublish = signal(false);
  public currentProject = signal<any>(null);

  public tableParams: TableParamsObject = new TableParamsObject();

  public documentTableColumns: TableColumn[] = [
    { name: 'select_all_box', value: 'select_all_box', width: '5%', nosort: true },
    { name: 'Name', value: 'displayName', width: '30%' },
    { name: 'Date', value: 'datePosted', width: '26%' },
    { name: 'Document Author', value: 'documentAuthor', width: '29%' },
    { name: 'status', value: 'status', width: '10%' },
  ];

  ngOnInit(): void {
    // Read project from storage (set by parent component) — no resolver dependency
    const stored = this.storageService.currentProjectData;
    if (stored) {
      this.currentProject.set(stored);
    } else {
      // Fallback: load project id from route param (parent route owns :notificationProjectId)
      const notificationProjectId = this.route.parent?.snapshot.paramMap.get('notificationProjectId');
      if (!notificationProjectId) {
        alert('Uh-oh, couldn\'t load documents');
        this.router.navigate(['/search']);
        return;
      }
      // Load the project before fetching docs
      this.searchService.getItem(notificationProjectId, 'ProjectNotification')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: any) => {
            if (res?.data) {
              this.storageService.state.currentProject = { type: 'currentProjectNotification', data: res.data, docTotal: 0 };
              this.currentProject.set(res.data);
              this.initTable();
            } else {
              alert('Uh-oh, couldn\'t load documents');
              this.router.navigate(['/search']);
            }
          },
          error: () => {
            alert('Uh-oh, couldn\'t load documents');
            this.router.navigate(['/search']);
          }
        });
      return;
    }

    this.initTable();
  }

  private initTable(): void {
    this.tableParams.sortBy = '-datePosted';
    this.tableParams.pageSize = 10;
    this.tableParams.currentPage = 1;
    this.refreshDocuments();
  }

  public selectAction(action) {
    const promises = [];

    // select all documents
    switch (action) {
      case 'copyLink':

        if (this.documentTableData()) {
          this.documentTableData().data.map(item => {
            if (item.checkbox === true) {
              this.createRowCopy(item);
              this.toastService.info(
                'A  PUBLIC  link to this document has been copied.'
              );
            }
          });
        }
        break;
      case 'selectAll':
        let someSelected = false;

        const tableData = this.documentTableData();
        if (tableData) {
          tableData.data.forEach(item => {
            if (item.checkbox === true) { someSelected = true; }
          });
          tableData.data.forEach(item => {
            item.checkbox = !someSelected;
          });
        }

        this.selectedCount.set({ ...this.selectedCount(), total: someSelected ? 0 : (tableData?.data.length ?? 0) });
        this.setPublishUnpublish();
        break;
      case 'delete':
        this.deleteDocument();
        break;
      case 'download':
        if (this.documentTableData()) {
          this.documentTableData().data.map(item => {
            if (item.checkbox === true) {
              promises.push(
                this.documentService.downloadDocument(
                  this.docs.filter(d => d._id === item._id)[0]
                )
              );
            }
          });
        }

        return Promise.all(promises).then(() => {
          this.logger.debug('Download initiated for file(s)', 'ProjectNotificationDocumentsComponent');
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
      backdropClass: 'custom-backdrop',
    });

    modalRef.componentInstance.title = 'Publish Document(s)';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to publish the selected Documents or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.loading.set(true);
          const observables = [];

          const tableData = this.documentTableData();
          if (tableData) {
            tableData.data.forEach(item => {
              if (item.checkbox && !item.read.includes('public')) {
                observables.push(this.documentService.publish(item._id));
              }
            });
          }

          forkJoin(observables).subscribe({
            error: err => {
              this.logger.error('publish documents failed', 'ProjectNotificationDocumentsComponent', err);
              this.toastService.error('Failed to publish document(s).');
              this.loading.set(false);
            },
            complete: () => {
              this.loading.set(false);
              this.canUnpublish.set(false);
              this.canPublish.set(false);
              this.toastService.success('Document(s) published successfully.');
              this.refreshDocuments();
            }
          });
        } else {
          this.loading.set(false);
        }
      })
      .catch(() => {
        this.loading.set(false);
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
          this.loading.set(true);
          const observables = [];

          const tableData = this.documentTableData();
          if (tableData) {
            tableData.data.forEach(item => {
              if (item.checkbox && item.read.includes('public')) {
                observables.push(this.documentService.unPublish(item._id));
              }
            });
          }

          forkJoin(observables).subscribe({
            error: err => {
              this.logger.error('unpublish documents failed', 'ProjectNotificationDocumentsComponent', err);
              this.toastService.error('Failed to unpublish document(s).');
              this.loading.set(false);
            },
            complete: () => {
              this.loading.set(false);
              this.canUnpublish.set(false);
              this.canPublish.set(false);
              this.toastService.success('Document(s) unpublished successfully.');
              this.refreshDocuments();
            }
          });
        } else {
          this.loading.set(false);
        }
      })
      .catch(() => {
        this.loading.set(false);
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
          this.loading.set(true);
          const itemsToDelete = [];

          const tableData = this.documentTableData();
          if (tableData) {
            tableData.data.forEach(item => {
              if (item.checkbox === true) {
                itemsToDelete.push(firstValueFrom(this.documentService.delete(item)));
              }
            });
          }

          try {
            await Promise.all(itemsToDelete);
            this.toastService.success('Document(s) deleted successfully.');
            this.refreshDocuments();
          } catch (err) {
            this.logger.error('delete documents failed', 'ProjectNotificationDocumentsComponent', err);
            this.toastService.error('Failed to delete document(s).');
            this.loading.set(false);
          }
        }
      })
      .catch(() => {
        this.loading.set(false);
      });
  }

  private refreshDocuments(): void {
    HttpCacheService.clearByResource('search');
    this.loading.set(true);
    const project = this.currentProject();
    if (!project?._id) { return; }

    const sortBy = this.tableParams.sortBy
      ? (this.tableParams.sortBy.substr(1) === 'displayName'
          ? this.tableParams.sortBy
          : `${this.tableParams.sortBy},+displayName`)
      : '-datePosted,+displayName';

    this.searchService.getSearchResults(
      null,
      'Document',
      [],
      this.tableParams.currentPage,
      this.tableParams.pageSize,
      sortBy,
      { documentSource: 'PROJECT-NOTIFICATION', project: project._id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        if (res[0].data && res[0].data.meta.length > 0) {
          this.docs = res[0].data.searchResults;
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        } else {
          this.docs = [];
          this.tableParams.totalListItems = 0;
          this.documentTableData.set(null);
        }
        this.setRowData();
        this.selectedCount.set({ categorized: 0, total: 0 });
        this.canPublish.set(false);
        this.canUnpublish.set(false);
        this.loading.set(false);
      });
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

      this.documentTableData.set(new TableObject(
        PnDocumentTableRowsComponent,
        documentList,
        this.tableParams
      ));
    } else {
      this.documentTableData.set(null);
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
    this.loading.set(true);
    this.tableParams.currentPage = page;
    const project = this.currentProject();
    if (!project?._id) { return; }

    const sortBy = this.tableParams.sortBy.substr(1) === 'displayName'
      ? this.tableParams.sortBy
      : `${this.tableParams.sortBy},+displayName`;

    this.searchService.getSearchResults(
      null,
      'Document',
      [],
      this.tableParams.currentPage,
      this.tableParams.pageSize,
      sortBy,
      { documentSource: 'PROJECT-NOTIFICATION', project: project._id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.docs = res[0].data.searchResults;
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.setRowData();
        this.loading.set(false);
      });
  }

  isEnabled(button) {
    const total = this.selectedCount().total;
    switch (button) {
      case 'copyLink':
        return total === 1;
      case 'publish':
        return total > 0 && this.canPublish();
      case 'unpublish':
        return total > 0 && this.canUnpublish();
      default:
        return total > 0;
    }
  }

  updateSelectedRow(changeEvent) {
    this.selectedCount.set({ ...this.selectedCount(), total: changeEvent.count });
    this.setPublishUnpublish();
  }

  setPublishUnpublish() {
    let canPub = false;
    let canUnpub = false;

    const tableData = this.documentTableData();
    if (tableData) {
      for (const document of tableData.data) {
        if (document.checkbox) {
          if (document.read.includes('public')) {
            canUnpub = true;
          } else {
            canPub = true;
          }
        }
        if (canPub && canUnpub) { break; }
      }
    }

    this.canPublish.set(canPub);
    this.canUnpublish.set(canUnpub);
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
    const safeName = encodeString(
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
}
