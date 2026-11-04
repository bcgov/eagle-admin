import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ProjectNotificationUploadComponent } from './project-notification-upload.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Document } from 'src/app/models/document';

describe('ProjectNotificationUploadComponent', () => {
  let project: { _id: string; name: string; docTotal: number };
  let toast: jasmine.SpyObj<ToastService>;
  let documents: jasmine.SpyObj<DocumentService>;

  beforeEach(async () => {
    const configService = jasmine.createSpyObj('ConfigService', ['ensureListsLoaded']);
    Object.defineProperty(configService, 'listsSignal', { value: signal([]) });
    project = { _id: '6a3c4c034e547e4250daf03b', name: 'Test Notification', docTotal: 0 };
    toast = jasmine.createSpyObj('ToastService', ['error', 'success', 'warning']);
    documents = jasmine.createSpyObj('DocumentService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ProjectNotificationUploadComponent],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: configService },
        { provide: StorageService, useValue: { currentProjectData: project, state: { currentProject: project } } },
        { provide: DocumentService, useValue: documents },
        { provide: ToastService, useValue: toast },
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

  // One picked file and a filled form, so only the notification id decides whether Upload is enabled.
  function createWithFile() {
    const fixture = TestBed.createComponent(ProjectNotificationUploadComponent);
    fixture.componentInstance.documents = [{ documentFileName: 'letter.pdf', upfile: new File(['x'], 'letter.pdf') } as Document];
    fixture.detectChanges();
    // The template marks these required; OnPush needs a mark to show the change.
    fixture.componentInstance.myForm.patchValue({ type: 'doctype-1', author: 'Proponent', date: { year: 2026, month: 11, day: 4 } });
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    const upload = Array.from(fixture.nativeElement.querySelectorAll('button[type="submit"]') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent.trim() === 'Upload');
    return { fixture, upload };
  }

  it('enables Upload on a notification with an Eagle id', () => {
    const { upload } = createWithFile();

    expect(upload.disabled).toBeFalse();
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it('disables Upload and says why on a notification DEMI created', () => {
    project._id = '0b0f3c9e-5d0a-4a8e-9a43-0c1d2e3f4a5b';
    const { fixture, upload } = createWithFile();

    fixture.componentInstance.uploadDocuments();

    expect(upload.disabled).toBeTrue();
    expect(documents.add).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledWith('Documents can be added once this notification has an Eagle id.');
  });
});
