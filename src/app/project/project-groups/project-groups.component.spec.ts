import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ProjectGroupsComponent } from './project-groups.component';
import { ExcelService } from 'src/app/services/excel.service';
import { LoggingService } from 'src/app/services/logging.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { User } from 'src/app/models/demi/user';
import { Group } from 'src/app/models/demi/group';

describe('ProjectGroupsComponent', () => {
  let component: ProjectGroupsComponent;
  let params: BehaviorSubject<Record<string, string>>;
  let userService: jasmine.SpyObj<UserService>;
  let toast: jasmine.SpyObj<ToastService>;
  let modalResult: Promise<unknown>;

  beforeEach(() => {
    params = new BehaviorSubject<Record<string, string>>({ currentPage: '2', pageSize: '25', sortBy: '-name' });
    userService = jasmine.createSpyObj('UserService', ['listProjectGroups', 'getUsersByIds', 'addGroup', 'deleteGroup']);
    toast = jasmine.createSpyObj('ToastService', ['success', 'warning', 'error']);
    userService.listProjectGroups.and.returnValue(of({ rows: [{ id: 'g1', projectId: 'track-42', name: 'Agencies', members: [] }], total: 26 }));

    TestBed.configureTestingModule({
      imports: [ProjectGroupsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params,
            snapshot: { params: {} },
            parent: { snapshot: { paramMap: convertToParamMap({ projId: '5885109faaecd9001b81314c' }) } }
          }
        },
        { provide: UserService, useValue: userService },
        { provide: StorageService, useValue: { currentProjectData: { _id: '5885109faaecd9001b81314c', demiId: 'track-42' }, state: {} } },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: modalResult }) } },
        { provide: ExcelService, useValue: jasmine.createSpyObj('ExcelService', ['exportAsExcelFile']) },
        { provide: NavigationStackUtils, useValue: {} },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component = TestBed.createComponent(ProjectGroupsComponent).componentInstance;
    component.ngOnInit();
  });

  it('lists groups under the resolved project\'s DEMI id with the URL page and name sort', () => {
    expect(userService.listProjectGroups).toHaveBeenCalledWith('track-42', 2, 25, '-name');
  });

  it('hands the DEMI total to the table', () => {
    expect(component.tableParams.totalListItems).toBe(26);
  });

  it('keeps the DEMI project id across page changes', () => {
    params.next({ currentPage: '3', pageSize: '25', sortBy: '+name' });

    expect(userService.listProjectGroups).toHaveBeenCalledWith('track-42', 3, 25, 'name');
  });

  it('exports the ticked groups\' members through one batched read', async () => {
    userService.getUsersByIds.and.returnValue(of([]));
    component.entries()[0].members = ['u1', 'u2'];
    component.entries()[0].checkbox = true;

    await component.exportItems();

    expect(userService.getUsersByIds).toHaveBeenCalledWith(['u1', 'u2']);
  });

  it('warns when DEMI returns fewer contacts than the groups list', async () => {
    userService.getUsersByIds.and.returnValue(of([{ id: 'u1' } as User]));
    component.entries()[0].members = ['u1', 'u2'];
    component.entries()[0].checkbox = true;

    await component.exportItems();

    expect(toast.warning).toHaveBeenCalledWith('1 of 2 contacts could not be read and are left out.');
  });

  it('adds a group under the project\'s DEMI id', async () => {
    modalResult = Promise.resolve('Agencies');
    userService.addGroup.and.returnValue(of({} as Group));

    await component.addNewGroup();

    expect(userService.addGroup).toHaveBeenCalledOnceWith('track-42', 'Agencies');
  });

  it('shows DEMI\'s reason when it refuses a new group', async () => {
    modalResult = Promise.resolve('Agencies');
    userService.addGroup.and.returnValue(throwError(() => Object.assign(new Error('name: already used in this project'), { status: 400 })));

    await component.addNewGroup();

    expect(toast.error).toHaveBeenCalledWith('The group could not be added. name: already used in this project');
  });

  it('deletes each ticked group by its DEMI id', async () => {
    modalResult = Promise.resolve(true);
    userService.deleteGroup.and.returnValue(of({} as Group));
    component.entries()[0].checkbox = true;

    await component.deleteItems();

    expect(userService.deleteGroup).toHaveBeenCalledOnceWith('g1');
  });
});
