import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AddDocumentComponent } from './add-documents.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

describe('AddDocumentComponent', () => {
  let http: HttpTestingController;
  let storage: StorageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDocumentComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute, useValue: {
            url: of([]),
            params: of({}),
            snapshot: { queryParams: {}, params: {} },
            parent: { parent: { snapshot: { params: { projId: 'eagle-project-1' } } } }
          }
        },
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error', 'warn', 'info']) }
      ]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
    storage.state = { type: 'selectedDocumentsForCP', data: { data: [] } };
  });

  afterEach(() => http.verify());

  function setProject(data: any, type = 'currentProject') {
    storage.state = { type: 'currentProject', data: { type, data } };
  }

  function render() {
    const fixture = TestBed.createComponent(AddDocumentComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('lists the project documents from DEMI by the DEMI project id', () => {
    setProject({ _id: 'eagle-project-1', demiId: 'demi-project-1', name: 'Project' });
    const fixture = render();

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('demi-project-1');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('count')).toBe('true');
    expect(req.request.params.has('documentSource')).toBeFalse();
    req.flush([
      { id: 'uuid-1', eagleId: 'eagle-doc-1', projectId: 'demi-project-1', displayName: 'Report' },
      { id: 'uuid-2', eagleId: null, projectId: 'demi-project-1', displayName: 'DEMI only' }
    ], { headers: { 'x-total-count': '2' } });

    // DEMI-only rows cannot be linked to an eagle-api comment period.
    expect(fixture.componentInstance.documentTableData.data.map(d => d._id)).toEqual(['eagle-doc-1']);
  });

  it('resolves the DEMI project id when the stored project has none', () => {
    setProject({ _id: 'eagle-project-1', name: 'Project' });
    render();

    http.expectOne('/demi/api/projects/eagle-project-1').flush({ id: 'demi-project-1', eagleId: 'eagle-project-1' });
    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('demi-project-1');
    req.flush([]);
  });

  it('lists a notification\'s documents by the notification id', () => {
    setProject({ _id: 'notification-1', name: 'Notice' }, 'currentProjectNotification');
    render();

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('notification-1');
    req.flush([]);
  });
});
