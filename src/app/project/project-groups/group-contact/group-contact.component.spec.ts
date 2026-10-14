import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, throwError } from 'rxjs';
import { GroupContactComponent } from './group-contact.component';
import { ExcelService } from 'src/app/services/excel.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { User } from 'src/app/models/demi/user';
import { Group } from 'src/app/models/demi/group';
import { Project } from 'src/app/models/project';

/** `count` fresh members u00.., emails m00..; names run the other way so name and email order differ. */
function members(count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i).padStart(2, '0');
    return { id: `u${n}`, displayName: `Name ${String(count - 1 - i).padStart(2, '0')}`, email: `m${n}@example.com` } as User;
  });
}

function groupOf(rows: User[]): Group {
  return { id: 'g1', projectId: 't1', name: 'Agencies', members: rows.map(row => row.id) };
}

interface Setup {
  url?: Record<string, string>;
  group?: Observable<Group>;
  users?: User[];
}

describe('GroupContactComponent', () => {
  let component: GroupContactComponent;
  let getUsersByIds: jasmine.Spy;
  let projectService: jasmine.SpyObj<ProjectService>;
  let toast: jasmine.SpyObj<ToastService>;
  let navigate: jasmine.Spy;
  let confirm: Promise<boolean>;

  function create({ url = { groupId: 'g1' }, users = members(3), group = of(groupOf(users)) }: Setup = {}) {
    getUsersByIds = jasmine.createSpy('getUsersByIds').and.returnValue(of(users));
    TestBed.configureTestingModule({
      imports: [GroupContactComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: url, paramMap: convertToParamMap(url) },
            parent: { snapshot: { paramMap: convertToParamMap({ projId: 'p1' }) } }
          }
        },
        { provide: UserService, useValue: { getGroup: () => group, getUsersByIds } },
        { provide: ProjectService, useValue: projectService },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1' }, state: {} } },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: confirm }) } },
        { provide: ExcelService, useValue: {} },
        { provide: NavigationStackUtils, useValue: {} },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    // No detectChanges: the load runs from ngOnInit and needs no rendered template.
    component = TestBed.createComponent(GroupContactComponent).componentInstance;
    component.ngOnInit();
  }

  beforeEach(() => {
    projectService = jasmine.createSpyObj('ProjectService', ['addGroupMembers', 'deleteGroupMembers', 'saveGroup']);
    projectService.addGroupMembers.and.returnValue(of({} as Project));
    projectService.deleteGroupMembers.and.returnValue(of({} as Project));
    toast = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);
    confirm = Promise.resolve(true);
  });

  describe('members page from the URL', () => {
    beforeEach(() => create({ url: { groupId: 'g1', currentPage: '2', pageSize: '25', sortBy: '-email' }, users: members(30) }));

    it('reads the members the DEMI group lists', () => {
      expect(getUsersByIds.calls.mostRecent().args[0].length).toBe(30);
    });

    it('counts every member, not just the page', () => {
      expect(component.tableParams.totalListItems).toBe(30);
    });

    it('shows the URL page of the URL sort', () => {
      expect(component.users.map(u => u.email)).toEqual(
        ['m04@example.com', 'm03@example.com', 'm02@example.com', 'm01@example.com', 'm00@example.com']
      );
    });

    it('keeps the URL page and page size in the table', () => {
      expect(component.tableData.paginationData.currentPage).toBe(2);
      expect(component.tableData.paginationData.pageSize).toBe(25);
    });

    it('re-pages locally by name without another read', () => {
      component.tableParams.sortBy = '+displayName';
      component.tableParams.pageSize = 2;
      spyOn(window, 'scrollTo');

      component.getPaginatedContacts(1);

      expect(component.users.map(u => u.displayName)).toEqual(['Name 00', 'Name 01']);
      expect(getUsersByIds).toHaveBeenCalledTimes(1);
    });

    it('clears ticks when the page changes', () => {
      component.users[0].checkbox = true;
      component.updateSelectedRow(1);
      spyOn(window, 'scrollTo');

      component.getPaginatedContacts(1);

      expect(component.selectedCount).toBe(0);
    });
  });

  it('sorts by name when the URL sort is not a column', () => {
    create({ url: { groupId: 'g1', sortBy: '+lastName,+firstName' } });

    expect(component.tableParams.sortBy).toBe('+displayName');
  });

  it('warns when DEMI does not return every member', () => {
    const shown = members(2);
    create({ users: shown, group: of({ ...groupOf(shown), members: ['u00', 'u01', 'u99'] }) });

    expect(toast.warning).toHaveBeenCalledWith('1 member could not be read and is not shown.');
  });

  it('goes back to the group list and says why when the group read fails', () => {
    create({ group: throwError(() => new Error('Group not found')) });

    expect(toast.error).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/p', 'p1', 'project-groups']);
  });

  describe('member changes from the contact picker', () => {
    beforeEach(() => create({ users: [{ id: 'a' } as User, { id: 'b' } as User] }));

    it('adds only the newly chosen contacts', () => {
      component.update([{ id: 'b' } as User, { id: 'c' } as User], component);

      expect(projectService.addGroupMembers).toHaveBeenCalledOnceWith(jasmine.objectContaining({ _id: 'p1' }), 'g1', ['c']);
    });

    it('removes only the members no longer chosen', () => {
      component.update([{ id: 'b' } as User, { id: 'c' } as User], component);

      expect(projectService.deleteGroupMembers).toHaveBeenCalledOnceWith('p1', 'g1', 'a');
    });

    it('writes nothing when the choice is unchanged', () => {
      component.update([{ id: 'a' } as User, { id: 'b' } as User], component);

      expect(projectService.addGroupMembers).not.toHaveBeenCalled();
      expect(projectService.deleteGroupMembers).not.toHaveBeenCalled();
    });
  });

  describe('removing ticked members', () => {
    beforeEach(() => create({ url: { groupId: 'g1', currentPage: '2', pageSize: '2' }, users: members(3) }));

    it('drops removed members from the list and moves back to the last page', async () => {
      component.users.forEach(user => user.checkbox = true);

      await component.deleteItems();

      expect(component.tableParams.totalListItems).toBe(2);
      expect(component.tableParams.currentPage).toBe(1);
    });

    it('keeps a member whose removal failed', async () => {
      projectService.deleteGroupMembers.and.returnValue(throwError(() => new Error('403')));
      component.users.forEach(user => user.checkbox = true);

      await component.deleteItems();

      expect(component.tableParams.totalListItems).toBe(3);
      expect(toast.error).toHaveBeenCalledWith('1 of 1 contacts could not be removed.');
    });
  });

  it('says so when the new group name cannot be saved', async () => {
    projectService.saveGroup.and.returnValue(throwError(() => new Error('500')));
    create();

    await component.saveName();

    expect(toast.error).toHaveBeenCalledWith('The group name could not be saved.');
  });
});
