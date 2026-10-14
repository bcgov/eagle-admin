import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GroupContactSelectComponent } from './group-contact-select.component';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { User } from 'src/app/models/demi/user';

describe('GroupContactSelectComponent', () => {
  let component: GroupContactSelectComponent;
  let listUsers: jasmine.Spy;

  beforeEach(() => {
    listUsers = jasmine.createSpy('listUsers').and.returnValue(of({ rows: [{ id: 'b' } as User, { id: 'c' } as User], total: 2 }));
    TestBed.configureTestingModule({
      imports: [GroupContactSelectComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: UserService, useValue: { listUsers } },
        {
          provide: StorageService,
          useValue: {
            currentProjectData: { _id: 'p1' },
            state: {
              // Handed over by the members screen, sorted there by email.
              sortBy: '+email',
              tableColumns: [{ name: 'Name', value: 'displayName' }, { name: 'Email', value: 'email' }],
              selectedUsers: [{ id: 'b' }],
              rowComponent: class {}
            }
          }
        },
        {
          provide: NavigationStackUtils,
          useValue: { getNavigationStack: () => [{}], getLastNavigationObject: () => ({ backUrl: [], breadcrumbs: [] }) }
        },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    component = TestBed.createComponent(GroupContactSelectComponent).componentInstance;
    component.ngOnInit();
  });

  it('asks DEMI for the name sort instead of the handed-over email sort', () => {
    expect(listUsers.calls.mostRecent().args[0].sort).toBe('displayName');
  });

  it('shows the name sort in the table header', () => {
    expect(component.tableParams.sortBy).toBe('+displayName');
  });

  it('turns off sorting on columns DEMI cannot sort', () => {
    expect(component.tableColumns.find(c => c.value === 'email').nosort).toBeTrue();
  });

  it('ticks the rows already in the group', () => {
    expect(component.tableData.data.map(row => row.checkbox)).toEqual([true, false]);
  });
});
