import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { EMPTY, NEVER, Observable, of, throwError } from 'rxjs';
import { AddEditProjectNotificationComponent } from './add-edit-project-notification.component';
import { DemiList } from 'src/app/models/demi/demi-list';
import { List } from 'src/app/models/demi/list';
import { DemiProject } from 'src/app/models/demi/project';
import { ConfigService } from 'src/app/services/config.service';
import { LoggingService } from 'src/app/services/logging.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Constants } from 'src/app/shared/utils/constants';
import { convertJSDateToNGBDate } from 'src/app/shared/utils/utils';

describe('AddEditProjectNotificationComponent', () => {
  let projectService: jasmine.SpyObj<ProjectService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let notifications: jasmine.SpyObj<NotificationProjectService>;
  let fixture: ComponentFixture<AddEditProjectNotificationComponent>;
  let lists: ReturnType<typeof signal<List[]>>;

  // `id` is the Track id; `eagleId` is set only on projects mirrored from Eagle.
  const project = (id: string, name: string, eagleId?: string | null): DemiProject => ({ id, name, eagleId });
  const rows = [
    project('track-1', 'Alpha Mine', 'e1'),
    project('track-2', 'Track Only Dam'),
    project('track-3', 'Null Id Road', null),
    project('track-4', 'Gamma Pipeline', 'e4')
  ];

  // Edit route on a notification referred to the Minister, so the template renders the project select.
  function create(list: Observable<DemiList<DemiProject>>, associatedProjectId = '', path = 'edit') {
    projectService = jasmine.createSpyObj('ProjectService', ['list']);
    projectService.list.and.returnValue(list);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    notifications = jasmine.createSpyObj('NotificationProjectService', ['add', 'save']);
    lists = signal<List[]>([]);

    TestBed.configureTestingModule({
      imports: [AddEditProjectNotificationComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { url: of([{ path }]) } },
        { provide: ProjectService, useValue: projectService },
        { provide: ToastService, useValue: toastService },
        { provide: NotificationProjectService, useValue: notifications },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['warn', 'error', 'info', 'debug']) },
        { provide: ConfigService, useValue: { listsSignal: lists } }
      ]
    });
    TestBed.inject(StorageService).state = {
      type: 'currentProject',
      data: {
        type: 'currentProjectNotification',
        data: {
          _id: 'pn1', demiId: 'demi-pn1', name: 'Notice', read: ['staff'], type: 'Mines', trigger: '', centroid: [50, -120],
          decision: 'Referred to Minister for Designation Decision', decisionDate: null,
          notificationReceivedDate: null, associatedProjectId
        }
      }
    };
    fixture = TestBed.createComponent(AddEditProjectNotificationComponent);
    fixture.detectChanges();
  }

  const select = () => fixture.nativeElement.querySelector('select#project') as HTMLSelectElement;
  const optionNames = () => Array.from(select().options).map(option => option.textContent.trim());

  it('requests one page of up to 1000 projects', () => {
    create(of({ rows }));

    expect(projectService.list).toHaveBeenCalledOnceWith({ pageSize: 1000 });
  });

  it('offers only projects that have an Eagle id', () => {
    create(of({ rows }));

    expect(optionNames()).toEqual(['None', 'Alpha Mine', 'Gamma Pipeline']);
  });

  it('maps each project to its Eagle id and name', () => {
    create(of({ rows }));

    expect(fixture.componentInstance.projects).toEqual([
      { _id: 'e1', name: 'Alpha Mine' },
      { _id: 'e4', name: 'Gamma Pipeline' }
    ]);
  });

  it('preselects the associated project stored by Eagle id', () => {
    create(of({ rows }), 'e4');

    expect(select().selectedOptions[0].textContent.trim()).toBe('Gamma Pipeline');
  });

  it('offers the regions when the Lists arrive after the form', () => {
    create(of({ rows }));

    lists.set([{ id: 'r1', name: 'Peace', type: 'region', legislation: 0, listOrder: 0 }]);
    fixture.detectChanges();

    const regions = fixture.nativeElement.querySelectorAll('select#region option');
    expect(Array.from<HTMLElement>(regions).map(option => option.textContent.trim())).toEqual(['Peace']);
  });

  it('shows an error toast when the project list fails', () => {
    create(throwError(() => new Error('DEMI down')));

    expect(toastService.error).toHaveBeenCalledOnceWith('Failed to load projects.');
  });

  // Every control validateForm requires, inside the B.C. bounds.
  function fillForm() {
    fixture.componentInstance.myForm.patchValue({
      name: 'Notice', type: 'Mines', subType: 'Coal Mines', proponent: 'Lynn Valley People', nature: 'New Construction',
      decision: 'In Progress', region: 'Lower Mainland', location: 'Lynn Valley', description: 'Test',
      notificationThresholdValue: 75, notificationThresholdUnits: 'tonnes/year',
      notificationReceivedDate: { year: 2026, month: 6, day: 24 }, latitude: 49.3, longitude: -123.0
    });
    fixture.componentInstance.triggers = [{ name: 'Organic/Inorganic Chemicals' }];
  }

  it('saves an edit to the row\'s DEMI id and opens the details by the route id', () => {
    create(of({ rows }));
    notifications.save.and.returnValue(of({ id: 'demi-pn1', eagleId: 'pn1', name: 'Notice', centroid: [] } as any));
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fillForm();

    fixture.componentInstance.onSubmit(null);

    expect(notifications.save).toHaveBeenCalledOnceWith('demi-pn1', jasmine.objectContaining({ notificationThresholdValue: 75 }), null);
    expect(navigate).toHaveBeenCalledOnceWith(['/pn', 'pn1', 'details']);
  });

  it('stays on the form when DEMI refuses the add', () => {
    create(of({ rows }), '', 'add');
    notifications.add.and.returnValue(EMPTY);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fillForm();

    fixture.componentInstance.onSubmit(true);

    expect(notifications.add).toHaveBeenCalledOnceWith(jasmine.objectContaining({ name: 'Notice' }), true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('saves a missing decision date as null and the received date as a Date', () => {
    create(of({ rows }));
    notifications.save.and.returnValue(NEVER);
    fillForm();
    fixture.componentInstance.myForm.patchValue({ decision: Constants.NOTIFICATION_DECISIONS.REFERRED });

    fixture.componentInstance.onSubmit(null);

    expect(notifications.save).toHaveBeenCalledOnceWith('demi-pn1',
      jasmine.objectContaining({ decisionDate: null, notificationReceivedDate: jasmine.any(Date) }), null);
  });

  it('refuses a received date the datepicker could not parse', () => {
    create(of({ rows }));
    fillForm();
    fixture.componentInstance.myForm.patchValue({ notificationReceivedDate: '2026-13-45' });
    const alert = spyOn(window, 'alert');

    fixture.componentInstance.onSubmit(null);

    expect(notifications.save).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledOnceWith('Notification Received Date is not a valid date.');
  });

  it('refuses a decision date the datepicker could not parse once a decision is made', () => {
    create(of({ rows }));
    fillForm();
    fixture.componentInstance.myForm.patchValue({ decision: Constants.NOTIFICATION_DECISIONS.REFERRED, decisionDate: '2026-13-45' });
    const alert = spyOn(window, 'alert');

    fixture.componentInstance.onSubmit(null);

    expect(notifications.save).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledOnceWith('Decision Date is not a valid date.');
  });

  it('saves the 1969 day old eagle-api rows use for no date as null', () => {
    create(of({ rows }));
    notifications.save.and.returnValue(NEVER);
    fillForm();
    fixture.componentInstance.myForm.patchValue({
      decision: Constants.NOTIFICATION_DECISIONS.REFERRED,
      decisionDate: convertJSDateToNGBDate(new Date('1969-12-31T08:00:00.000Z'))
    });

    fixture.componentInstance.onSubmit(null);

    expect(notifications.save).toHaveBeenCalledOnceWith('demi-pn1', jasmine.objectContaining({ decisionDate: null }), null);
  });

  it('sends one save while the first is in flight', () => {
    create(of({ rows }));
    notifications.save.and.returnValue(NEVER);
    fillForm();

    fixture.componentInstance.onSubmit(null);
    fixture.componentInstance.onSubmit(null);

    expect(notifications.save).toHaveBeenCalledTimes(1);
  });

  it('allows a second save after DEMI refuses the first', () => {
    create(of({ rows }));
    notifications.save.and.returnValue(EMPTY);
    fillForm();

    fixture.componentInstance.onSubmit(null);
    fixture.componentInstance.onSubmit(null);

    expect(notifications.save).toHaveBeenCalledTimes(2);
  });
});
