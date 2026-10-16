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

  // `handedOver` is the sort the members screen leaves in storage for this screen.
  function create(handedOver: string) {
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
              sortBy: handedOver,
              tableColumns: [
                { name: '', value: 'check', nosort: true },
                { name: 'Name', value: 'displayName' },
                { name: 'Organization', value: 'orgName' },
                { name: 'Email', value: 'email' },
                { name: 'Phone Number', value: 'phoneNumber' }
              ],
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
  }

  beforeEach(() => {
    listUsers = jasmine.createSpy('listUsers').and.returnValue(of({ rows: [{ id: 'b' } as User, { id: 'c' } as User], total: 2 }));
  });

  [
    ['+orgName', 'orgName'],
    ['-orgName', '-orgName'],
    ['+email', 'email'],
    ['-email', '-email'],
    ['+phoneNumber', 'phoneNumber'],
    ['-phoneNumber', '-phoneNumber']
  ].forEach(([sortBy, sort]) => {
    it(`asks DEMI for sort=${sort} when the header sort is ${sortBy}`, () => {
      create(sortBy);

      expect(listUsers.calls.mostRecent().args[0].sort).toBe(sort);
      expect(component.tableParams.sortBy).toBe(sortBy);
    });
  });

  ['orgName', 'email', 'phoneNumber'].forEach(value => {
    it(`lets the ${value} header sort`, () => {
      create('+displayName');

      expect(component.tableColumns.find(c => c.value === value).nosort).toBeFalsy();
    });
  });

  it('sorts by name when the handed-over sort is not one DEMI can sort', () => {
    create('+lastName,+firstName');

    expect(listUsers.calls.mostRecent().args[0].sort).toBe('displayName');
    expect(component.tableParams.sortBy).toBe('+displayName');
  });

  it('ticks the rows already in the group', () => {
    create('+displayName');

    expect(component.tableData.data.map(row => row.checkbox)).toEqual([true, false]);
  });
});
