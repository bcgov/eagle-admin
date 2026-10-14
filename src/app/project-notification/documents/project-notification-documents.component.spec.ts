import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ProjectNotificationDocumentsComponent } from './project-notification-documents.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

describe('ProjectNotificationDocumentsComponent', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectNotificationDocumentsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: SearchService, useValue: {} },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success', 'info']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error', 'warn', 'info']) }
      ]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    TestBed.inject(StorageService).state = {
      type: 'currentProject',
      data: { type: 'currentProjectNotification', data: { _id: 'notification-1', name: 'Notice' } }
    };
  });

  afterEach(() => http.verify());

  it('lists the notification documents from DEMI, newest first', () => {
    const fixture = TestBed.createComponent(ProjectNotificationDocumentsComponent);
    fixture.detectChanges();

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('notification-1');
    expect(req.request.params.get('sort')).toBe('-datePosted');
    expect(req.request.params.get('count')).toBe('true');
    expect(req.request.params.getAll('documentSource')).toEqual(['PROJECT-NOTIFICATION']);
    req.flush([
      { id: 'uuid-1', eagleId: 'eagle-doc-1', projectId: 'notification-1', documentSource: 'PROJECT-NOTIFICATION', displayName: 'Notice letter', isPublished: true }
    ], { headers: { 'x-total-count': '1' } });

    const rows = fixture.componentInstance.documentTableData().data;
    expect(rows.map(d => d._id)).toEqual(['eagle-doc-1']);
    expect(rows[0].isPublished).toBeTrue();
  });

  it('lets select-all pick only notification documents, so comment attachments cannot be published', () => {
    const fixture = TestBed.createComponent(ProjectNotificationDocumentsComponent);
    fixture.detectChanges();
    http.expectOne(r => r.url === '/demi/api/documents').flush([
      { id: 'n1', eagleId: 'n1', projectId: 'notification-1', documentSource: 'PROJECT-NOTIFICATION', displayName: 'Notice letter' },
      { id: 'c1', eagleId: 'c1', projectId: 'notification-1', documentSource: 'COMMENT', displayName: 'Attachment' }
    ]);

    fixture.componentInstance.selectAction('selectAll');

    const rows = fixture.componentInstance.documentTableData().data;
    expect(rows.filter(d => d.checkbox).map(d => d._id)).toEqual(['n1']);
    expect(fixture.componentInstance.selectedCount().total).toBe(1);
  });
});
