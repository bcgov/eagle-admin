import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { ApplicationSortTableRowsComponent } from './application-sort-table-rows/application-sort-table-rows.component';
import { DemiDocument } from 'src/app/models/demi/document';
import { DemiList } from 'src/app/models/demi/demi-list';
import { LegacyProject } from 'src/app/models/demi/project-legacy';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils, nextSortBy, tableSort } from 'src/app/shared/utils/table-template-utils';
import { applicationDocumentFilters } from 'src/app/shared/utils/utils';
import { legacyDocumentRow, nativeDocumentSort } from '../document-edit/legacy-document-row';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-application-sort',
  imports: [
    RouterModule,
    TableTemplateComponent
  ],
  templateUrl: './application-sort.component.html',
  styleUrl: './application-sort.component.css',

})
export class DocumentApplicationSortComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);
  private documentService = inject(DocumentService);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private configService = inject(ConfigService);
  private destroyRef = inject(DestroyRef);

  public currentProject: LegacyProject = null;
  public loading = true;
  public documents: any[] = null;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: TableColumn[] = [
    {
      name: 'Order',
      value: 'sortOrder',
      width: '10%',
    },
    {
      name: 'Name',
      value: 'displayName',
      width: '30%'
    },
    {
      name: 'Status',
      value: 'status',
      width: '5%',
      nosort: true
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: '15%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '15%',
      nosort: true
    },
    {
      name: 'Milestone',
      value: 'milestone',
      width: '15%',
      nosort: true
    },
    {
      name: 'Legislation',
      value: 'legislation',
      width: '10%',
      nosort: true
    }
  ];

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.storageService.state.editedDocs = [];
    this.route.params
      .pipe(
        switchMap(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
          this.tableParams.sortBy = tableSort(this.nativeSort(this.tableParams.sortBy));
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          this._changeDetectionRef.markForCheck();
          return this.fetchDocuments(this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy, this.tableParams.keywords);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(page => this.showPage(page));
  }

  /** DEMI sorts documents by one key; any other sort, such as an old multi-key URL, falls back to the sort order. */
  private nativeSort(sortBy: string | null | undefined): string {
    return nativeDocumentSort(sortBy) ?? 'sortOrder';
  }

  /** One page of this project's application documents. Documents carry the DEMI project id, not the Eagle one. */
  private fetchDocuments(page: number, pageSize: number, sortBy: string, keywords: string): Observable<DemiList<DemiDocument>> {
    return this.documentService.listNative({
      page: page || 1,
      pageSize: pageSize || 10,
      count: true,
      sort: this.nativeSort(sortBy),
      q: keywords || undefined,
      filters: applicationDocumentFilters(this.configService.lists, this.currentProject.demiId)
    });
  }

  /** Shows a page, keeping sort orders edited on earlier pages. */
  private showPage(page: DemiList<DemiDocument>) {
    const edited = new Map<string, any>((this.storageService.state.editedDocs ?? []).map((doc: any) => [doc._id, doc]));
    this.tableParams.totalListItems = page.total ?? 0;
    this.documents = page.rows.map(row => {
      const doc = legacyDocumentRow(row);
      const previous = doc._id ? edited.get(doc._id) : undefined;
      return {
        ...doc,
        status: doc.isPublished ? 'Published' : 'Not Published',
        sortOrder: previous ? previous.sortOrder : doc.sortOrder
      };
    });
    this.setRowData();
    this.loading = false;
    this._changeDetectionRef.markForCheck();
  }

  setRowData() {
    const list = [];
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

  onSave() {
    const formData = new FormData();
    const edited: any[] = this.storageService.state.editedDocs;
    // A document with no Eagle id cannot be written through eagle-api.
    const skipped = edited.filter(document => !document._id);
    if (skipped.length) {
      const names = skipped.map(document => document.displayName || document.id).join(', ');
      this.toastService.warning(`Sort order not saved for ${skipped.length} document(s) not in Eagle yet: ${names}`);
    }
    edited.filter(document => document._id).forEach((document: any) => {
      // document service put id and sort order
      formData.set('sortOrder', document.sortOrder);
      this.documentService.update(formData, document._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    });
    this.toastService.success('Successfully updated sort order.');
    this.router.navigate(['/p/' + this.currentProject._id + '/project-documents']);
  }

  onCancel() {
    this.router.navigate(['/p/' + this.currentProject._id + '/project-documents']);
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.getPaginatedDocs(1);
  }

  getPaginatedDocs(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    const currentPage = pageNumber || 1;
    const pageSize = this.tableData?.paginationData.pageSize || 10;
    const sortBy = tableSort(this.nativeSort(this.tableParams.sortBy));
    const keywords = this.tableParams.keywords || '';
    this.tableParams.currentPage = currentPage;
    this.tableParams.sortBy = sortBy;

    this.fetchDocuments(currentPage, pageSize, sortBy, keywords)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(page => {
        this.tableTemplateUtils.updateUrl(sortBy, currentPage, pageSize, null, keywords);
        this.showPage(page);
      });
  }

}
