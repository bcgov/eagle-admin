import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { ApplicationSortTableRowsComponent } from './application-sort-table-rows/application-sort-table-rows.component';
import { Project } from 'src/app/models/project';
import { User } from 'src/app/models/user';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { createProjectTabModifiers } from 'src/app/shared/utils/utils';
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
  private searchService = inject(SearchService);
  private toastService = inject(ToastService);
  private documentService = inject(DocumentService);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private configService = inject(ConfigService);
  private destroyRef = inject(DestroyRef);

  public currentProject: Project = null;
  public loading = true;
  public documents: User[] = null;

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
      value: 'name',
      width: '30%'
    },
    {
      name: 'Status',
      value: 'status',
      width: '5%'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: '15%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '15%'
    },
    {
      name: 'Milestone',
      value: 'milestone',
      width: '15%'
    },
    {
      name: 'Legislation',
      value: 'legislation',
      width: '10%'
    }
  ];

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.storageService.state.editedDocs = [];
    this.route.params
      .pipe(
        switchMap(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '+sortOrder,-datePosted,+displayName';
            this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          }
          this._changeDetectionRef.markForCheck();

          const projectId = this.currentProject._id;
          const tabModifier = createProjectTabModifiers(this.configService.lists);
          return this.searchService.getSearchResults(
            this.tableParams.keywords || '',
            'Document',
            [{ 'name': 'project', 'value': projectId }],
            this.tableParams.currentPage,
            this.tableParams.pageSize,
            this.tableParams.sortBy,
            tabModifier,
            true
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => {
          if (res) {
            if (res[0].data.meta && res[0].data.meta.length > 0) {
              this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
              this.documents = res[0].data.searchResults;
            } else {
              this.tableParams.totalListItems = 0;
              this.documents = [];
            }
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.markForCheck();
          } else {
            this.toastService.error('Uh-oh, couldn\'t load documents');
            this.router.navigate(['/search']);
          }
        });
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
    this.storageService.state.editedDocs.forEach((document: any) => {
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

    const tabModifier = createProjectTabModifiers(this.configService.lists);
    this.searchService.getSearchResults(
      keywords,
      'Document',
      [{ 'name': 'project', 'value': projectId }],
      currentPage,
      pageSize,
      sortBy,
      tabModifier,
      true)
      .pipe(takeUntilDestroyed(this.destroyRef))
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
            this.toastService.error('Uh-oh, couldn\'t load documents');
            this.tableParams.totalListItems = 0;
            this.documents = [];
          }
          this.loading = false;
          this._changeDetectionRef.markForCheck();
        });
  }

}
