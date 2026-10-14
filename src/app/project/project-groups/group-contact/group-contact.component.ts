import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { Group } from 'src/app/models/demi/group';
import { User, contactExportRow } from 'src/app/models/demi/user';
import { ExcelService } from 'src/app/services/excel.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils, nextSortBy } from 'src/app/shared/utils/table-template-utils';
import { FormsModule } from '@angular/forms';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { GroupTableRowsComponent } from './group-table-rows/group-table-rows.component';
import { LoggingService } from 'src/app/services/logging.service';
import { CommonModule } from '@angular/common';

/** `rows` ordered by a table `sortBy` such as `+displayName` or `-email`. */
function sortContacts(rows: User[], sortBy: string): User[] {
  const desc = sortBy.startsWith('-');
  const field = sortBy.replace(/^[+-]/, '') || 'displayName';
  const text = (row: User) => String(row[field] ?? '');
  return [...rows].sort((a, b) => (desc ? -1 : 1) * text(a).localeCompare(text(b)));
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-group-contact',
  imports: [
    FormsModule,
    RouterModule,
    TableTemplateComponent,
    CommonModule
  ],
  templateUrl: './group-contact.component.html',
  styleUrl: './group-contact.component.css',

})
export class GroupContactComponent implements OnInit {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private modalService = inject(NgbModal);
  private excelService = inject(ExcelService);
  private navigationStackUtils = inject(NavigationStackUtils);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  private groupId: string = null;
  /** Every member DEMI returns; the table shows one sorted page of it. */
  private members: User[] = [];

  public currentProject;
  public users: User[] = null;
  public group: Group = null;
  public loading = true;
  public tempGroupName = '';

  public tableData: TableObject;
  public tableColumns: TableColumn[] = [
    {
      name: '',
      value: 'check',
      width: '5%',
      nosort: true
    },
    {
      name: 'Name',
      value: 'displayName',
      width: '26%'
    },
    {
      name: 'Organization',
      value: 'orgName',
      width: '26%'
    },
    {
      name: 'Email',
      value: 'email',
      width: '27%'
    },
    {
      name: 'Phone Number',
      value: 'phoneNumber',
      width: '15%'
    }
  ];

  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.storageService.state.selectedUsers = null;

    const snap = this.route.snapshot;
    this.groupId = snap.paramMap.get('groupId');
    this.tableParams.currentPage = +snap.params.currentPage || 1;
    this.tableParams.pageSize = +snap.params.pageSize || 10;
    const sortable = this.tableColumns.filter(column => !column.nosort).map(column => column.value);
    const urlSort: string = snap.params.sortBy ?? '';
    // An old or hand-edited sort (e.g. `+lastName,+firstName`) would leave the list unsorted.
    this.tableParams.sortBy = sortable.includes(urlSort.slice(1)) && /^[+-]/.test(urlSort) ? urlSort : '+displayName';

    this.userService.getGroup(this.groupId).pipe(
      switchMap(group => this.userService.getUsersByIds(group.members ?? []).pipe(map(members => ({ group, members })))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({ group, members }) => {
        this.group = group;
        this.tempGroupName = group.name;
        this.members = members;
        const missing = new Set((group.members ?? []).filter(Boolean)).size - members.length;
        if (missing > 0) {
          this.toastService.warning(`${missing} member${missing === 1 ? '' : 's'} could not be read and ${missing === 1 ? 'is' : 'are'} not shown.`);
        }
        this.showPage();
        this.loading = false;
        this._changeDetectionRef.markForCheck();
      },
      error: err => {
        this.logger.error('group load failed', 'GroupContactComponent', err);
        this.toastService.error('This group could not be loaded.');
        this.router.navigate(['/p', this.currentProject._id, 'project-groups']);
      }
    });
  }

  isEnabled(button) {
    if (button === 'selectAll') {
      return (this.users?.length ?? 0) > 0;
    } else {
      return this.selectedCount > 0;
    }
  }

  private showPage() {
    const lastPage = Math.max(1, Math.ceil(this.members.length / this.tableParams.pageSize));
    this.tableParams.currentPage = Math.min(this.tableParams.currentPage, lastPage);
    const { currentPage, pageSize, sortBy } = this.tableParams;
    // Rows are reused across pages; a tick on a page no longer shown must not count.
    this.members.forEach(member => member.checkbox = false);
    this.selectedCount = 0;
    const start = (currentPage - 1) * pageSize;
    this.users = sortContacts(this.members, sortBy).slice(start, start + pageSize);
    this.tableParams.totalListItems = this.members.length;
    this.setRowData();
  }

  setRowData() {
    this.tableData = new TableObject(
      GroupTableRowsComponent,
      [...(this.users ?? [])],
      this.tableParams
    );
  }

  setColumnSort(column) {
    this.tableParams.sortBy = nextSortBy(this.tableParams.sortBy, column);

    this.getPaginatedContacts(1);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'add':
        // Add activity
        this.setBackURL();
        break;
      case 'copyEmail':
        this.copyEmail();
        break;
      case 'export':
        this.exportItems();
        break;
      case 'delete':
        // Add activity
        this.deleteItems();
        break;
      case 'selectAll':
        const someSelected = this.tableData.data.some((item: User) => item.checkbox === true);
        this.tableData.data.forEach((item: User) => item.checkbox = !someSelected);

        this.selectedCount = someSelected ? 0 : this.tableData.data.length;
        this._changeDetectionRef.markForCheck();
        break;
    }
  }

  private selectedRows(): User[] {
    return this.tableData.data.filter((item: User) => item.checkbox === true);
  }

  copyEmail() {
    const userData = this.selectedRows().map(user => user.email).filter(Boolean).map(email => email + ';').join('');
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = userData;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.toastService.success('Emails have been copied to your clipboard.');
  }

  exportItems() {
    const userData = this.selectedRows().map(contactExportRow);
    this.logger.debug('export data prepared', 'GroupContactComponent', userData);
    this.excelService.exportAsExcelFile(userData, 'contactList');
  }

  setBackURL() {
    this.storageService.state.update = this.update;
    this.storageService.state.component = this;
    this.storageService.state.componentModel = 'User';
    this.storageService.state.tableColumns = this.tableColumns;
    this.storageService.state.rowComponent = GroupTableRowsComponent;
    this.storageService.state.sortBy = this.tableParams.sortBy;
    this.storageService.state.groupId = this.groupId;
    this.storageService.state.selectedUsers = [...this.members];

    this.navigationStackUtils.pushNavigationStack(
      ['/p', this.currentProject._id, 'project-groups', 'g', this.groupId, 'members'],
      [
        {
          route: ['/projects'],
          label: 'All Projects'
        },
        {
          route: ['/p', this.currentProject._id],
          label: this.currentProject.name
        },
        {
          route: ['/p', this.currentProject._id, 'project-groups'],
          label: 'Groups'
        },
        {
          route: ['/p', this.currentProject._id, 'project-groups', 'g', this.storageService.state.groupId, 'members'],
          label: this.group.name
        }
      ]
    );
    this.router.navigate(['/p', this.currentProject._id, 'project-groups', 'g', this.groupId, 'members', 'select', { pageSize: 25 }]);
  }

  /** Called by the contact picker with the full chosen list; `component` is this screen. */
  update(contacts: User[], component: GroupContactComponent) {
    const chosen = new Set(contacts.map(contact => contact.id));
    const current = new Set(component.members.map(member => member.id));
    const membersToAdd = [...chosen].filter(id => !current.has(id));
    const membersToRemove = [...current].filter(id => !chosen.has(id));

    const observables = [];
    if (membersToAdd.length > 0) {
      observables.push(component.projectService.addGroupMembers(component.currentProject, component.groupId, membersToAdd));
    }
    membersToRemove.forEach(id => {
      observables.push(component.projectService.deleteGroupMembers(component.currentProject._id, component.groupId, id));
    });

    const membersRoute = ['/p', component.currentProject._id, 'project-groups', 'g', component.groupId, 'members'];
    if (observables.length > 0) {
      forkJoin(observables)
        .subscribe({
          next: () => component.router.navigate(membersRoute),
          error: error => {
            component.logger.error('update group members failed', 'GroupContactComponent', error);
            component.toastService.error('Some member changes could not be saved.');
            // Reload so the list shows what was written.
            component.router.navigate(membersRoute);
          }
        });
    } else {
      component.router.navigate(membersRoute);
    }
  }

  public deleteItems() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static', // Prevent closing when clicking outside
      centered: true, // Center the modal
    });
    modalRef.componentInstance.title = 'Remove Contact';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to remove or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    return modalRef.result.then((isConfirmed) => {
      if (!isConfirmed) {
        return;
      }
      const ids = [...new Set(this.selectedRows().map(item => item.id))];
      return Promise.allSettled(ids.map(id =>
        firstValueFrom(this.projectService.deleteGroupMembers(this.currentProject._id, this.groupId, id))
      )).then(results => {
        const removed = new Set(ids.filter((_, i) => results[i].status === 'fulfilled'));
        const failed = ids.length - removed.size;
        if (failed > 0) {
          this.logger.error('remove group members failed', 'GroupContactComponent', results);
          this.toastService.error(`${failed} of ${ids.length} contacts could not be removed.`);
        }
        this.members = this.members.filter(member => !removed.has(member.id));
        this.showPage();
        this._changeDetectionRef.markForCheck();
      });
    }).catch(() => {
      // Modal dismissed.
    });
  }

  getPaginatedContacts(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);
    this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, '');
    this.showPage();
    this._changeDetectionRef.markForCheck();
  }

  async saveName() {
    try {
      await firstValueFrom(this.projectService.saveGroup(this.currentProject._id, this.group.id, { name: this.tempGroupName }));
      this.group.name = this.tempGroupName;
      this._changeDetectionRef.markForCheck();
      this.toastService.success('Group name has been updated');
    } catch (err) {
      this.logger.error('group rename failed', 'GroupContactComponent', err);
      this.toastService.error('The group name could not be saved.');
    }
  }

}
