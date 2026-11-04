import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, defer, of, throwError } from 'rxjs';
import { GroupContactComponent } from './group-contact.component';
import { ExcelService } from 'src/app/services/excel.service';
import { LoggingService } from 'src/app/services/logging.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { User } from 'src/app/models/demi/user';
import { Group } from 'src/app/models/demi/group';

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
  let groupWrites: jasmine.SpyObj<UserService>;
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
        { provide: UserService, useValue: { ...groupWrites, getGroup: () => group, getUsersByIds } },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1', demiId: 't1' }, state: {} } },
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
    groupWrites = jasmine.createSpyObj('UserService', ['addGroupMembers', 'removeGroupMember', 'renameGroup']);
    groupWrites.addGroupMembers.and.returnValue(of({} as Group));
    groupWrites.removeGroupMember.and.returnValue(of({} as Group));
    groupWrites.renameGroup.and.returnValue(of({} as Group));
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

    it('adds only the newly chosen contacts to the DEMI group', () => {
      component.update([{ id: 'b' } as User, { id: 'c' } as User], component);

      expect(groupWrites.addGroupMembers).toHaveBeenCalledOnceWith('g1', ['c']);
    });

    it('removes from the DEMI group only the members no longer chosen', () => {
      component.update([{ id: 'b' } as User, { id: 'c' } as User], component);

      expect(groupWrites.removeGroupMember).toHaveBeenCalledOnceWith('g1', 'a');
    });

    it('returns to the members page under the Eagle project id, not the DEMI one', () => {
      component.update([{ id: 'b' } as User], component);

      expect(navigate).toHaveBeenCalledWith(['/p', 'p1', 'project-groups', 'g', 'g1', 'members']);
    });

    it('sends a removal only after the add before it has finished', () => {
      const add = new Subject<Group>();
      groupWrites.addGroupMembers.and.returnValue(add);
      let removalSent = false;
      groupWrites.removeGroupMember.and.returnValue(defer(() => {
        removalSent = true;
        return of({} as Group);
      }));
      component.update([{ id: 'b' } as User, { id: 'c' } as User], component);
      expect(removalSent).toBeFalse();

      add.next({} as Group);
      add.complete();

      expect(removalSent).toBeTrue();
    });

    it('says why and reloads the members when a member change fails', () => {
      groupWrites.removeGroupMember.and.returnValue(throwError(() => new Error('The record is being written by another request. Try again.')));

      component.update([{ id: 'b' } as User], component);

      expect(toast.error).toHaveBeenCalledWith('Some member changes could not be saved. The record is being written by another request. Try again.');
      expect(navigate).toHaveBeenCalledWith(['/p', 'p1', 'project-groups', 'g', 'g1', 'members']);
    });

    it('writes nothing when the choice is unchanged', () => {
      component.update([{ id: 'a' } as User, { id: 'b' } as User], component);

      expect(groupWrites.addGroupMembers).not.toHaveBeenCalled();
      expect(groupWrites.removeGroupMember).not.toHaveBeenCalled();
    });
  });

  describe('removing ticked members', () => {
    beforeEach(() => create({ url: { groupId: 'g1', currentPage: '2', pageSize: '2' }, users: members(3) }));

    it('removes each ticked member from the DEMI group', async () => {
      component.users.forEach(user => user.checkbox = true);

      await component.deleteItems();

      expect(groupWrites.removeGroupMember).toHaveBeenCalledOnceWith('g1', 'u00');
    });

    it('drops removed members from the list and moves back to the last page', async () => {
      component.users.forEach(user => user.checkbox = true);

      await component.deleteItems();

      expect(component.tableParams.totalListItems).toBe(2);
      expect(component.tableParams.currentPage).toBe(1);
    });

    it('keeps a member whose removal failed', async () => {
      groupWrites.removeGroupMember.and.returnValue(throwError(() => new Error('Forbidden')));
      component.users.forEach(user => user.checkbox = true);

      await component.deleteItems();

      expect(component.tableParams.totalListItems).toBe(3);
      expect(toast.error).toHaveBeenCalledWith('1 of 1 contacts could not be removed. Forbidden');
    });
  });

  it('removes ticked members one after another', fakeAsync(() => {
    create({ users: members(2) });
    const first = new Subject<Group>();
    groupWrites.removeGroupMember.and.returnValues(first, of({} as Group));
    component.users.forEach(user => user.checkbox = true);
    component.deleteItems();
    flushMicrotasks();
    expect(groupWrites.removeGroupMember).toHaveBeenCalledTimes(1);

    first.next({} as Group);
    flushMicrotasks();

    expect(groupWrites.removeGroupMember).toHaveBeenCalledTimes(2);
  }));

  it('renames the DEMI group by its id', async () => {
    create();
    component.tempGroupName = 'First Nations';

    await component.saveName();

    expect(groupWrites.renameGroup).toHaveBeenCalledOnceWith('g1', 'First Nations');
  });

  it('shows DEMI\'s reason when it refuses the new group name', async () => {
    groupWrites.renameGroup.and.returnValue(throwError(() => new Error('name: must be at most 500 characters')));
    create();

    await component.saveName();

    expect(toast.error).toHaveBeenCalledWith('The group name could not be saved. name: must be at most 500 characters');
  });
});
