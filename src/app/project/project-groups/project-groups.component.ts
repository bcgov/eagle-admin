import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GroupsTableRowsComponent } from './project-groups-table-rows/project-groups-table-rows.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { InputModalComponent } from 'src/app/input-modal/input-modal.component';
import { SearchTerms } from 'src/app/models/search';
import { Group } from 'src/app/models/demi/group';
import { User, contactExportRow, nativeSort, tableSort } from 'src/app/models/demi/user';
import { ExcelService } from 'src/app/services/excel.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService, emptyPageOnError } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils, nextSortBy } from 'src/app/shared/utils/table-template-utils';
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
  private userService = inject(UserService);
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
  entries = signal<Group[]>([]);
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
          const sort = nativeSort(this.tableParams.sortBy, 'name');
          if (this.tableParams.sortBy !== tableSort(sort)) {
            this.tableParams.sortBy = tableSort(sort);
            this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          }

          const pageNum = this.tableParams.currentPage || 1;
          const pageSize = this.tableParams.pageSize || 25;

          // Groups are keyed by the DEMI project id, which the project resolver keeps beside the Eagle `_id`.
          return this.userService.listProjectGroups(this.currentProject().demiId, pageNum, pageSize, sort).pipe(
            emptyPageOnError<Group>(err => {
              this.logger.error('Failed to load groups', 'ProjectGroupsComponent', err);
              this.toastService.error('Groups could not be loaded.');
            })
          );
        })
      )
      .subscribe(({ rows, total }) => {
        this.tableParams.totalListItems = total ?? 0;
        this.entries.set(rows);
        this.setRowData();
        this.loadingState.stopLoading('project-groups');
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
        this.router.navigate(['/p', this.currentProject()._id, 'project-groups', 'g', selected[0].id, 'members']);
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
    const members = await this.selectedMembers();
    if (!members) { return; }
    const emailStr = members.map(user => user.email).filter(Boolean).map(email => email + ';').join('');

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
    const members = await this.selectedMembers();
    if (!members) { return; }
    const rows = members.map(contactExportRow);

    this.logger.debug('export data prepared', 'ProjectGroupsComponent', rows);
    this.excelService.exportAsExcelFile(rows, 'contactList');
  }

  /** Every member of the ticked groups, each once; null when the read fails. */
  private async selectedMembers(): Promise<User[] | null> {
    const data = this.tableData();
    if (!data) { return null; }
    const ids = new Set<string>(data.data.filter(group => group.checkbox === true).flatMap(group => group.members ?? []).filter(Boolean));
    try {
      const members = await firstValueFrom(this.userService.getUsersByIds([...ids]));
      if (members.length < ids.size) {
        this.toastService.warning(`${ids.size - members.length} of ${ids.size} contacts could not be read and are left out.`);
      }
      return members;
    } catch (err) {
      this.logger.error('group members read failed', 'ProjectGroupsComponent', err);
      this.toastService.error('Group contacts could not be loaded.');
      return null;
    }
  }

  async addNewGroup() {
    this.inputModal = this.modalService.open(InputModalComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    const result = await this.inputModal.result.catch(() => null);
    if (!result) { return; }
    try {
      await firstValueFrom(this.projectService.addGroup(this.currentProject(), result));
    } catch (err) {
      this.logger.error('add group failed', 'ProjectGroupsComponent', err);
      this.toastService.error('The group could not be added.');
    }
    this.onSubmit();
  }

  public async deleteItems() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
    });

    modalRef.componentInstance.title = 'Delete Groups';
    modalRef.componentInstance.message = 'Click <strong>OK</strong> to delete selected Group or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    const isConfirmed = await modalRef.result.catch(() => false);
    if (!isConfirmed) { return; }

    this.loadingState.startLoading('project-groups');
    const ids = (this.tableData()?.data ?? []).filter(item => item.checkbox === true).map(item => item.id);
    const results = await Promise.allSettled(
      ids.map(id => firstValueFrom(this.projectService.deleteGroup(this.currentProject(), id)))
    );
    const failed = results.filter(result => result.status === 'rejected').length;
    if (failed > 0) {
      this.logger.error('delete groups failed', 'ProjectGroupsComponent', results);
      this.toastService.error(`${failed} of ${ids.length} groups could not be deleted.`);
    }
    this.loadingState.stopLoading('project-groups');
    this.onSubmit();
  }

  isEnabled(button: string): boolean {
    if (button === 'edit') {
      return this.selectedCount() === 1;
    } else {
      return this.selectedCount() > 0;
    }
  }

  setColumnSort(column: string) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);
    this.onSubmit(1);
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
