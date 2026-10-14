import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AddEditContactComponent } from './add-edit-contact.component';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { User } from 'src/app/models/demi/user';

const CONTACT = {
  id: 'u1', firstName: 'Ada', middleName: null, lastName: 'Lee', displayName: 'Ada Lee',
  org: 'o1', orgName: 'EAO', email: 'ada@example.com'
} as User;

describe('AddEditContactComponent editing a DEMI contact', () => {
  let component: AddEditContactComponent;
  let userService: jasmine.SpyObj<UserService>;
  let toast: jasmine.SpyObj<ToastService>;
  let navigate: jasmine.Spy;
  let state: { contactForm: unknown; selectedOrganization: unknown };

  function create() {
    TestBed.configureTestingModule({
      imports: [AddEditContactComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ contactId: 'u1' }) } } },
        { provide: UserService, useValue: userService },
        { provide: StorageService, useValue: { state } },
        {
          provide: NavigationStackUtils,
          useValue: { getNavigationStack: () => null, getLastBackUrl: () => null }
        },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    // No detectChanges: the load runs from ngOnInit and needs no rendered template.
    component = TestBed.createComponent(AddEditContactComponent).componentInstance;
    component.ngOnInit();
  }

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', ['getUser', 'save']);
    userService.getUser.and.returnValue(of(CONTACT));
    userService.save.and.returnValue(of(null));
    toast = jasmine.createSpyObj('ToastService', ['error']);
    state = { contactForm: null, selectedOrganization: null };
  });

  it('reads the contact from DEMI by its id', () => {
    create();

    expect(userService.getUser).toHaveBeenCalledWith('u1');
  });

  it('shows the contact\'s organization name', () => {
    create();

    expect(component.contactOrganizationName).toBe('EAO');
  });

  it('uses a newly linked organization over the stored one', () => {
    state.selectedOrganization = { _id: 'o2', name: 'Other Org' };
    create();

    expect(component.contactForm.controls.org.value).toBe('o2');
  });

  it('saves a contact with no middle name without the text "null"', () => {
    create();

    component.onSubmit();

    const body = userService.save.calls.mostRecent().args[0];
    expect(body.displayName).toBe('Ada Lee');
    expect(body.middleName).not.toBe('null');
  });

  it('saves to the contact id from the route', () => {
    create();

    component.onSubmit();

    expect((userService.save.calls.mostRecent().args[0] as { _id: string })._id).toBe('u1');
  });

  it('tells the user and goes back to contacts when the read fails', () => {
    userService.getUser.and.returnValue(throwError(() => new Error('User not found')));
    create();

    expect(toast.error).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/contacts']);
  });
});
