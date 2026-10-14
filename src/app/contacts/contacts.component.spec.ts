import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ContactsComponent } from './contacts.component';
import { LoggingService } from '../services/logging.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';
import { NavigationStackUtils } from '../shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';
import { User } from '../models/demi/user';

describe('ContactsComponent', () => {
  let component: ContactsComponent;
  let params: BehaviorSubject<Record<string, string>>;
  let listUsers: jasmine.Spy;

  function create(first: Record<string, string>) {
    params = new BehaviorSubject(first);
    TestBed.configureTestingModule({
      imports: [ContactsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params } },
        { provide: UserService, useValue: { listUsers } },
        { provide: StorageService, useValue: { state: {} } },
        { provide: NavigationStackUtils, useValue: {} },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    // No detectChanges: the load runs from ngOnInit and needs no rendered template.
    component = TestBed.createComponent(ContactsComponent).componentInstance;
    component.ngOnInit();
  }

  beforeEach(() => {
    listUsers = jasmine.createSpy('listUsers').and.returnValue(of({ rows: [{ id: 'u1' } as User], total: 41 }));
  });

  it('asks DEMI for the URL page, keyword and name sort', () => {
    create({ currentPage: '2', pageSize: '10', keywords: 'ada', sortBy: '-displayName' });

    expect(listUsers).toHaveBeenCalledWith({ q: 'ada', page: 2, pageSize: 10, sort: '-displayName' });
  });

  it('replaces an old multi-column sort with the name sort', () => {
    create({ sortBy: '+lastName,+firstName' });

    expect(listUsers.calls.mostRecent().args[0].sort).toBe('displayName');
    expect(component.tableParams.sortBy).toBe('+displayName');
  });

  it('hands the DEMI total to the table', () => {
    create({});

    expect(component.tableParams.totalListItems).toBe(41);
  });

  it('keeps loading pages after one read fails', () => {
    listUsers.and.returnValues(
      throwError(() => new Error('page * pageSize must stay within 20000 rows')),
      of({ rows: [{ id: 'u2' } as User], total: 1 })
    );
    create({ currentPage: '9999' });

    params.next({ currentPage: '1' });

    expect(component.users.map(u => u.id)).toEqual(['u2']);
  });

  it('tells the user when a read fails', () => {
    listUsers.and.returnValue(throwError(() => new Error('DEMI unavailable')));
    create({});

    expect(TestBed.inject(ToastService).error).toHaveBeenCalled();
  });

  it('empties the table when a page has no rows', () => {
    listUsers.and.returnValues(of({ rows: [{ id: 'u1' } as User], total: 1 }), of({ rows: [], total: 0 }));
    create({});

    params.next({ keywords: 'nobody' });

    expect(component.documentTableData.data).toEqual([]);
  });
});
