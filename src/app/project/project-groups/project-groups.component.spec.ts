import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, of } from 'rxjs';
import { ProjectGroupsComponent } from './project-groups.component';
import { ExcelService } from 'src/app/services/excel.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { User } from 'src/app/models/demi/user';

describe('ProjectGroupsComponent', () => {
  let component: ProjectGroupsComponent;
  let params: BehaviorSubject<Record<string, string>>;
  let userService: jasmine.SpyObj<UserService>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    params = new BehaviorSubject<Record<string, string>>({ currentPage: '2', pageSize: '25', sortBy: '-name' });
    userService = jasmine.createSpyObj('UserService', ['listProjectGroups', 'getUsersByIds']);
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
        // No project methods: the groups read must not look the project up again.
        { provide: ProjectService, useValue: {} },
        { provide: StorageService, useValue: { currentProjectData: { _id: '5885109faaecd9001b81314c', demiId: 'track-42' }, state: {} } },
        { provide: NgbModal, useValue: {} },
        { provide: ExcelService, useValue: jasmine.createSpyObj('ExcelService', ['exportAsExcelFile']) },
        { provide: NavigationStackUtils, useValue: {} },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
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
});
