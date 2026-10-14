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
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);
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
        { provide: ToastService, useValue: toast },
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
    render();

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('demi-project-1');
    expect(req.request.params.getAll('documentSource')).toEqual(['PROJECT']);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('count')).toBe('true');
    req.flush([]);
  });

  it('keeps DEMI-only rows on the page but lets select-all link only rows with an Eagle id', () => {
    setProject({ _id: 'eagle-project-1', demiId: 'demi-project-1', name: 'Project' });
    const fixture = render();
    http.expectOne(r => r.url === '/demi/api/documents').flush([
      { id: 'uuid-1', eagleId: 'eagle-doc-1', projectId: 'demi-project-1', displayName: 'Report' },
      { id: 'uuid-2', eagleId: null, projectId: 'demi-project-1', displayName: 'DEMI only' }
    ], { headers: { 'x-total-count': '2' } });

    fixture.componentInstance.selectAction('selectAll');

    expect(fixture.componentInstance.documentTableData.data.length).toBe(2);
    expect(storage.state.selectedDocumentsForCP.data.map(d => d._id)).toEqual(['eagle-doc-1']);
    expect(fixture.componentInstance.selectedCount).toBe(1);
  });

  it('resolves the DEMI project id when the stored project has none', () => {
    setProject({ _id: 'eagle-project-1', name: 'Project' });
    render();

    http.expectOne('/demi/api/projects/eagle-project-1').flush({ id: 'demi-project-1', eagleId: 'eagle-project-1' });
    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('demi-project-1');
    req.flush([]);
  });

  it('tells the user when the DEMI project cannot be found', () => {
    setProject({ _id: 'eagle-project-1', name: 'Project' });
    render();

    http.expectOne('/demi/api/projects/eagle-project-1').flush('gone', { status: 404, statusText: 'Not Found' });

    expect(toast.error).toHaveBeenCalledWith('Could not load documents for this project.');
    http.expectNone(r => r.url === '/demi/api/documents');
  });

  it('lists a notification\'s documents by the notification id', () => {
    setProject({ _id: 'notification-1', name: 'Notice' }, 'currentProjectNotification');
    render();

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('notification-1');
    expect(req.request.params.getAll('documentSource')).toEqual(['PROJECT-NOTIFICATION']);
    req.flush([]);
  });
});
