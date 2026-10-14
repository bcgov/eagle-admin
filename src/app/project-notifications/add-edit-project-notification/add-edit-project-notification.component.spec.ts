import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AddEditProjectNotificationComponent } from './add-edit-project-notification.component';
import { DemiList } from 'src/app/models/demi/demi-list';
import { DemiProject } from 'src/app/models/demi/project';
import { ConfigService } from 'src/app/services/config.service';
import { LoggingService } from 'src/app/services/logging.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

describe('AddEditProjectNotificationComponent', () => {
  let projectService: jasmine.SpyObj<ProjectService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let fixture: ComponentFixture<AddEditProjectNotificationComponent>;

  // `id` is the Track id; `eagleId` is set only on projects mirrored from Eagle.
  const project = (id: string, name: string, eagleId?: string | null): DemiProject => ({ id, name, eagleId });
  const rows = [
    project('track-1', 'Alpha Mine', 'e1'),
    project('track-2', 'Track Only Dam'),
    project('track-3', 'Null Id Road', null),
    project('track-4', 'Gamma Pipeline', 'e4')
  ];

  // Edit route on a notification referred to the Minister, so the template renders the project select.
  function create(list: Observable<DemiList<DemiProject>>, associatedProjectId = '') {
    projectService = jasmine.createSpyObj('ProjectService', ['list']);
    projectService.list.and.returnValue(list);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [AddEditProjectNotificationComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { url: of([{ path: 'edit' }]) } },
        { provide: ProjectService, useValue: projectService },
        { provide: ToastService, useValue: toastService },
        { provide: NotificationProjectService, useValue: jasmine.createSpyObj('NotificationProjectService', ['add', 'save']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['warn', 'error', 'info', 'debug']) },
        { provide: ConfigService, useValue: { regions: [] } }
      ]
    });
    TestBed.inject(StorageService).state = {
      type: 'currentProject',
      data: {
        type: 'currentProjectNotification',
        data: {
          _id: 'pn1', name: 'Notice', read: ['staff'], type: 'Mines', trigger: '', centroid: [50, -120],
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

  it('shows an error toast when the project list fails', () => {
    create(throwError(() => new Error('DEMI down')));

    expect(toastService.error).toHaveBeenCalledOnceWith('Failed to load projects.');
  });
});
