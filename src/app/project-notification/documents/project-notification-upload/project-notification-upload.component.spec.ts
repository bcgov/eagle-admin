import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ProjectNotificationUploadComponent } from './project-notification-upload.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

describe('ProjectNotificationUploadComponent', () => {
  beforeEach(async () => {
    const configService = jasmine.createSpyObj('ConfigService', ['ensureListsLoaded']);
    Object.defineProperty(configService, 'listsSignal', { value: signal([]) });
    const project = { _id: 'pn1', name: 'Test Notification', docTotal: 0 };

    await TestBed.configureTestingModule({
      imports: [ProjectNotificationUploadComponent],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: configService },
        { provide: StorageService, useValue: { currentProjectData: project, state: { currentProject: project } } },
        { provide: DocumentService, useValue: {} },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error']) }
      ]
    }).compileComponents();
  });

  it('renders the file picker browse button', () => {
    const fixture = TestBed.createComponent(ProjectNotificationUploadComponent);
    fixture.detectChanges();

    const browse: HTMLButtonElement = fixture.nativeElement.querySelector('app-file-upload button.browse');
    expect(browse).not.toBeNull();
    expect(browse.type).toBe('button');
    expect(browse.textContent).toContain('browse');
  });
});
