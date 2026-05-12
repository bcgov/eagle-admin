import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GroupsTableRowsComponent } from './project-groups-table-rows/project-groups-table-rows.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { InputModalComponent } from 'src/app/input-modal/input-modal.component';
import { SearchTerms } from 'src/app/models/search';
import { User } from 'src/app/models/user';
import { ExcelService } from 'src/app/services/excel.service';
import { ProjectService } from 'src/app/services/project.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-project-groups',
  templateUrl: './project-groups.component.html',
  styleUrl: './project-groups.component.css',
  imports: [
    RouterModule,
    TableTemplateComponent
  ]
})
export class ProjectGroupsComponent implements OnInit {
  private excelService = inject(ExcelService);
  private modalService = inject(NgbModal);
  private navigationStackUtils = inject(NavigationStackUtils);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private loadingState = inject(LoadingStateService);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  readonly tabLinks = [
    { label: 'Contacts', link: 'project-groups' },
    { label: 'Participating Indigenous Nations', link: 'project-pins' }
  ];

  currentProject = signal<any>(null);
  entries = signal<User[]>([]);
  selectedCount = signal(0);
  tableData = signal<TableObject | null>(null);
  loading = this.loadingState.getOperationState('project-groups');

  entryCount = computed(() => this.entries().length);
  isEditEnabled = computed(() => this.selectedCount() === 1);
  isActionEnabled = computed(() => this.selectedCount() > 0);

  public terms = new SearchTerms();
  public typeFilters = [];
  private inputModal: NgbModalRef = null;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableColumns: TableColumn[] = [
    {
      name: '',
      value: 'check',
      width: '10%',
      nosort: true
    },
    {
      name: 'Name',
      value: 'name',
      width: '90%'
    }
  ];

  ngOnInit() {
    this.currentProject.set(this.storageService.currentProjectData);

    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(params => {
          this.loadingState.startLoading('project-groups');
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '-dateAdded';
            this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          }

          const projectId = this.route.parent?.snapshot.paramMap.get('projId') ?? this.route.snapshot.params['projId'];
          const pageNum = this.tableParams.currentPage || 1;
          const pageSize = this.tableParams.pageSize || 25;
          const sortBy = this.tableParams.sortBy || '+displayName';

          return this.searchService.getSearchResults(
            '', 'Group', [],
            pageNum, pageSize, sortBy,
            { project: projectId }, false, {}, ''
          ).pipe(
            catchError(err => {
              this.logger.error('Failed to load groups', 'ProjectGroupsComponent', err);
              return of([]);
            })
          );
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res?.length && res[0]?.data?.meta?.length > 0) {
            this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
            this.entries.set(res[0].data.searchResults);
          } else {
            this.tableParams.totalListItems = 0;
            this.entries.set([]);
          }
          this.setRowData();
          this.loadingState.stopLoading('project-groups');
        },
        error: (err) => {
          this.logger.error('Groups subscription failed', 'ProjectGroupsComponent', err);
          this.entries.set([]);
          this.loadingState.stopLoading('project-groups');
        }
      });
  }

  setRowData() {
    const entries = this.entries();
    if (entries.length > 0) {
      this.tableData.set(new TableObject(
        GroupsTableRowsComponent,
        [...entries],
        this.tableParams
      ));
    } else {
      this.tableData.set(null);
    }
  }

  updateSelectedRow(count: number) {
    this.selectedCount.set(count);
  }

  public selectAction(action) {
    switch (action) {
      case 'copyEmail':
        this.copyEmail();
        break;
      case 'selectAll': {
        const data = this.tableData();
        if (!data) { return; }
        let someSelected = false;
        data.data.forEach((item) => {
          if (item.checkbox === true) { someSelected = true; }
        });
        data.data.forEach((item) => {
          item.checkbox = !someSelected;
        });
        this.selectedCount.set(someSelected ? 0 : data.data.length);
        this.tableData.set(new TableObject(data.component, [...data.data], data.paginationData, data.extraData));
        break;
      }
      case 'edit': {
        this.navigationStackUtils.clearNavigationStack();
        const selected = this.tableData()!.data.filter(item => item.checkbox === true);
        this.router.navigate(['/p', this.currentProject()._id, 'project-groups', 'g', selected[0]._id, 'members']);
        break;
      }
      case 'add':
        this.addNewGroup();
        break;
      case 'delete':
        this.deleteItems();
        break;
      case 'export':
        this.exportItems();
        break;
    }
  }

  async copyEmail() {
    const data = this.tableData();
    if (!data) { return; }
    const itemsToExport = data.data.filter(item => item.checkbox === true);
    const list: string[] = [];
    itemsToExport.forEach(group => group.members.forEach(member => list.push(member)));

    const filteredArray = list.reduce((unique: string[], item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    const results = await Promise.all(
      filteredArray.map(item => firstValueFrom(this.searchService.getItem(item, 'User')))
    );
    const emailStr = results.map(p => p.data.email).join(';') + ';';

    this.logger.debug('email list copied to clipboard', 'ProjectGroupsComponent', emailStr);
    const selBox = document.createElement('textarea');
    selBox.style.cssText = 'position:fixed;left:0;top:0;opacity:0';
    selBox.value = emailStr;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.toastService.success('Emails have been copied to your clipboard.');
  }

  async exportItems() {
    const data = this.tableData();
    if (!data) { return; }
    const itemsToExport = data.data.filter(item => item.checkbox === true);
    const list: string[] = [];
    itemsToExport.forEach(group => group.members.forEach(member => list.push(member)));

    const filteredArray = list.reduce((unique: string[], item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    const results = await Promise.all(
      filteredArray.map(item => firstValueFrom(this.searchService.getItem(item, 'User')))
    );
    const rows = results.map(p => ({
      name: `${p.data.firstName} ${p.data.lastName}`,
      title: p.data.title,
      organization: p.data.orgName,
      phone: p.data.phoneNumber,
      address: p.data.address1 + (p.data.address2 === '' ? '' : p.data.address2),
      city: p.data.city,
      province: p.data.province,
      postal: p.data.postalCode,
      email: p.data.email
    }));

    this.logger.debug('export data prepared', 'ProjectGroupsComponent', rows);
    this.excelService.exportAsExcelFile(rows, 'contactList');
  }

  async addNewGroup() {
    this.inputModal = this.modalService.open(InputModalComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    const result = await this.inputModal.result.catch(() => null);
    if (result) {
      await firstValueFrom(this.projectService.addGroup(this.currentProject(), result));
      this.onSubmit();
    }
  }

  public async deleteItems() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
    });

    modalRef.componentInstance.title = 'Delete Groups';
    modalRef.componentInstance.message = 'Click <strong>OK</strong> to delete selected Group or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    try {
      const isConfirmed = await modalRef.result;

      if (isConfirmed) {
        this.loadingState.startLoading('project-groups');
        const data = this.tableData();
        if (data) {
          await Promise.all(
            data.data
              .filter(item => item.checkbox === true)
              .map(item => firstValueFrom(this.projectService.deleteGroup(this.currentProject(), item._id)))
          );
        }
        this.loadingState.stopLoading('project-groups');
        this.onSubmit();
      }
    } catch {
      this.loadingState.stopLoading('project-groups');
    }
  }

  isEnabled(button: string): boolean {
    if (button === 'edit') {
      return this.selectedCount() === 1;
    } else {
      return this.selectedCount() > 0;
    }
  }

  setColumnSort(column: string) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  // Called via storage service in shared module.
  add(contacts, component) {
    const filteredPins = [];
    contacts.filter((thing) => {
      const idx = component.entries().findIndex((t) => {
        return (t._id === thing._id);
      });
      if (idx === -1) {
        filteredPins.push(thing._id);
      }
    });
    alert('not implemented');
    // Add all the filtered new items.
    // component.projectService.addPins(component.currentProject, filteredPins)
    // // .takeUntil(component.ngUnsubscribe)
    // .subscribe(
    //   () => { // onCompleted
    //     // this.loading.set(false);
    //     // this.router.navigated = false;
    //     // this.openSnackBar('This project was created successfuly.', 'Close');
    //     component.router.navigate(['/p', component.currentProject._id, 'project-pins']);
    //   },
    //   error => {
    //     this.logger.error(error, 'ProjectGroupsComponent');
    //     alert('Uh-oh, couldn\'t edit project');
    //   },
    // );
  }

  public onSubmit(pageNumber = 1, reset = false) {
    this.loadingState.startLoading('project-groups');

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;

    if (reset) {
      this.tableParams.sortBy = '';
      this.tableParams.pageSize = 25;
      this.tableParams.keywords = '';
      this.typeFilters = [];
    }

    params['sortBy'] = this.tableParams.sortBy;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    if (this.typeFilters.length > 0) { params['type'] = this.typeFilters.toString(); }

    this.router.navigate(['p', this.currentProject()._id, 'project-groups', params]);
  }

  public toggleFilter(filterItem) {
    if (this.typeFilters.includes(filterItem)) {
      this.typeFilters = this.typeFilters.filter(item => item !== filterItem);
    } else {
      this.typeFilters.push(filterItem);
    }
  }

}
