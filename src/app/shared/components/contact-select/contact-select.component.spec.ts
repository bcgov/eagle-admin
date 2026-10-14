import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ContactSelectComponent, toPickedContact } from './contact-select.component';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { User } from 'src/app/models/demi/user';

const ROW = { id: '5c9e2b1f8a0c3d0019a1b2c3', displayName: 'Ada Lee', orgName: 'EAO', middleName: null } as User;

describe('toPickedContact', () => {
  it('gives the project form tabs the DEMI id as _id', () => {
    expect(toPickedContact(ROW)._id).toBe('5c9e2b1f8a0c3d0019a1b2c3');
  });

  it('keeps the display name the form tabs store', () => {
    expect(toPickedContact(ROW).displayName).toBe('Ada Lee');
  });

  it('does not turn a missing middle name into the text "null"', () => {
    expect(toPickedContact(ROW).middleName).toBeUndefined();
  });
});

describe('ContactSelectComponent', () => {
  let component: ContactSelectComponent;
  let listUsers: jasmine.Spy;

  beforeEach(() => {
    listUsers = jasmine.createSpy('listUsers').and.returnValue(of({ rows: [ROW], total: 1 }));
    TestBed.configureTestingModule({
      imports: [ContactSelectComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ sortBy: '+orgName' }) } },
        { provide: UserService, useValue: { listUsers } },
        { provide: StorageService, useValue: { state: { componentModel: 'User', rowComponent: class {} } } },
        {
          provide: NavigationStackUtils,
          useValue: { getNavigationStack: () => [{}], getLastNavigationObject: () => ({ backUrl: [], breadcrumbs: [] }) }
        },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    component = TestBed.createComponent(ContactSelectComponent).componentInstance;
    component.ngOnInit();
  });

  it('sorts by name when the URL asks for a column DEMI cannot sort', () => {
    expect(listUsers.calls.mostRecent().args[0].sort).toBe('displayName');
  });

  it('hands the table legacy rows keyed by _id', () => {
    expect(component.tableData.data[0]._id).toBe('5c9e2b1f8a0c3d0019a1b2c3');
  });
});
