import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ProjectDocumentsUploadComponent } from './project-documents-upload.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

describe('ProjectDocumentsUploadComponent', () => {
  beforeEach(async () => {
    const configService = jasmine.createSpyObj('ConfigService', ['ensureListsLoaded']);
    Object.defineProperty(configService, 'listsSignal', { value: signal([]) });

    await TestBed.configureTestingModule({
      imports: [ProjectDocumentsUploadComponent],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: configService },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1', name: 'Test Project' }, state: {} } },
        { provide: DocumentService, useValue: {} },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error']) }
      ]
    }).compileComponents();
  });

  it('renders the file picker browse button', () => {
    const fixture = TestBed.createComponent(ProjectDocumentsUploadComponent);
    fixture.detectChanges();

    const browse: HTMLButtonElement = fixture.nativeElement.querySelector('app-file-upload button.browse');
    expect(browse).not.toBeNull();
    expect(browse.type).toBe('button');
    expect(browse.textContent).toContain('browse');
  });
});
