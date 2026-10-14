import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DocumentApplicationSortComponent } from './application-sort.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';

const LISTS = [
  { id: 'type18', type: 'doctype', name: 'Application Materials', legislation: 2018 },
  { id: 'memo18', type: 'doctype', name: 'Independent Memo', legislation: 2018 },
  { id: 'mile18', type: 'label', name: 'Revised EAC Application', legislation: 2018 },
  { id: 'amend18', type: 'projectPhase', name: 'Post Decision - Amendment', legislation: 2018 },
  { id: 'app18', type: 'projectPhase', name: 'Application Development & Review', legislation: 2018 }
];

// Mirrored DEMI row: `id` and `eagleId` are the Eagle id, `projectId` the DEMI project id.
const ROW = {
  id: 'doc-eagle-1', eagleId: 'doc-eagle-1', projectId: 'demi-p1', projectEagleId: 'eagle-p1',
  displayName: 'Application.pdf', typeId: 'type18', milestoneId: 'mile18', isPublished: false, sortOrder: 3
};

describe('DocumentApplicationSortComponent', () => {
  let http: HttpTestingController;
  let storage: { currentProjectData: any; state: any };

  function init(params: Record<string, string>): DocumentApplicationSortComponent {
    storage = { currentProjectData: { _id: 'eagle-p1', demiId: 'demi-p1' }, state: {} };
    TestBed.configureTestingModule({
      imports: [DocumentApplicationSortComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: of(params) } },
        { provide: StorageService, useValue: storage },
        { provide: ConfigService, useValue: { lists: LISTS, getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    http = TestBed.inject(HttpTestingController);
    const component = TestBed.createComponent(DocumentApplicationSortComponent).componentInstance;
    component.ngOnInit();
    return component;
  }

  function documentsRequest(): TestRequest {
    return http.expectOne(r => r.url === '/demi/api/documents');
  }

  afterEach(() => http.verify());

  it('asks DEMI for the project application documents by DEMI project id, in sort order', () => {
    init({});

    const params = documentsRequest().request.params;
    expect(params.get('project')).toBe('demi-p1');
    expect(params.get('sort')).toBe('sortOrder');
    expect(params.get('documentSource')).toBe('PROJECT');
    expect(params.getAll('typeId')).toEqual(['type18', 'memo18']);
    expect(params.getAll('milestoneId')).toEqual(['mile18']);
    expect(params.getAll('projectPhaseId')).toEqual(['app18']);
    expect(params.get('count')).toBe('true');
  });

  it('falls back to sort order for an old multi-key sort URL', () => {
    const component = init({ sortBy: '+sortOrder,-datePosted,+displayName' });

    expect(documentsRequest().request.params.get('sort')).toBe('sortOrder');
    expect(component.tableParams.sortBy).toBe('+sortOrder');
  });

  it('keeps a descending date sort', () => {
    init({ sortBy: '-datePosted' });

    expect(documentsRequest().request.params.get('sort')).toBe('-datePosted');
  });

  it('sends the keywords as q', () => {
    init({ keywords: 'memo' });

    expect(documentsRequest().request.params.get('q')).toBe('memo');
  });

  it('shows rows under their Eagle id with the publish status and total', () => {
    const component = init({});

    documentsRequest().flush([ROW], { headers: { 'x-total-count': '12' } });

    expect(component.documents[0]._id).toBe('doc-eagle-1');
    expect(component.documents[0].status).toBe('Not Published');
    expect(component.tableParams.totalListItems).toBe(12);
  });

  it('keeps a sort order edited on an earlier page', () => {
    const component = init({});
    documentsRequest().flush([]);
    storage.state.editedDocs = [{ _id: 'doc-eagle-1', sortOrder: 1 }];

    component.getPaginatedDocs(2);
    const req = documentsRequest();
    expect(req.request.params.get('page')).toBe('2');
    req.flush([ROW]);

    expect(component.documents[0].sortOrder).toBe(1);
  });
});
