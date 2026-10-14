import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { DocumentEditComponent } from './document-edit.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

const nativeRow = {
  id: '3f2a9c1e-uuid',
  projectId: 'demi-project-1',
  eagleId: 'eagle-doc-1',
  projectEagleId: 'eagle-project-1',
  displayName: 'Report',
  documentFileName: 'report.pdf',
  type: 'Letter',
  typeId: 'type-1',
  milestoneId: 'milestone-1',
  projectPhaseId: 'phase-1',
  documentAuthorTypeId: 'author-1',
  datePosted: '2020-01-02T00:00:00.000Z',
  legislation: 2018,
  isPublished: false
};

const legacyRow = {
  _id: 'legacy-doc-1',
  project: 'eagle-project-1',
  displayName: 'Letter',
  documentFileName: 'letter.pdf',
  type: 'type-1',
  milestone: 'milestone-1',
  projectPhase: 'phase-1',
  documentAuthorType: 'author-1',
  datePosted: '2020-01-02T00:00:00.000Z',
  legislation: 2018,
  read: ['staff', 'public']
};

describe('DocumentEditComponent', () => {
  let http: HttpTestingController;
  let storage: StorageService;

  beforeEach(async () => {
    const configService = {
      listsSignal: signal([]),
      ensureListsLoaded: () => Promise.resolve(),
      getApiPath: () => '/api',
      getDemiApiPath: () => '/demi/api'
    };

    await TestBed.configureTestingModule({
      imports: [DocumentEditComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: configService },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error', 'warn', 'info']) }
      ]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
    storage.state = { type: 'currentProject', data: { type: 'currentProject', data: { _id: 'route-project', name: 'Project' } } };
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
  });

  afterEach(() => http.verify());

  function render(rows: any[]) {
    storage.state = { type: 'selectedDocs', data: rows };
    const fixture = TestBed.createComponent(DocumentEditComponent);
    fixture.detectChanges();
    return fixture;
  }

  function button(fixture, label: string): HTMLButtonElement | undefined {
    return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find(b => b.textContent.trim() === label);
  }

  it('saves a native row to eagle-api by its Eagle id and Eagle project id', () => {
    const fixture = render([nativeRow]);

    button(fixture, 'Save').click();

    const req = http.expectOne('/api/document/eagle-doc-1');
    expect(req.request.method).toBe('PUT');
    const body = req.request.body as FormData;
    expect(body.get('project')).toBe('eagle-project-1');
    expect(body.get('type')).toBe('type-1');
    expect(body.get('milestone')).toBe('milestone-1');
    req.flush({});
  });

  it('saves a legacy row by its _id', () => {
    const fixture = render([legacyRow]);

    button(fixture, 'Save').click();

    const req = http.expectOne('/api/document/legacy-doc-1');
    expect(req.request.method).toBe('PUT');
    expect((req.request.body as FormData).get('project')).toBe('eagle-project-1');
    req.flush({});
  });

  it('unpublishes a published native row by its Eagle id', () => {
    const fixture = render([{ ...nativeRow, isPublished: true }]);

    button(fixture, 'Save & Unpublish').click();

    const req = http.expectOne('/api/document/eagle-doc-1/unpublish');
    expect(req.request.method).toBe('PUT');
    req.flush({});
    http.expectOne('/api/document/eagle-doc-1').flush({});
  });

  it('shows no save for a row with no Eagle id, and says why', () => {
    const fixture = render([{ ...nativeRow, eagleId: null }]);

    expect(button(fixture, 'Save')).toBeUndefined();
    expect(button(fixture, 'Save & Publish')).toBeUndefined();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('no Eagle record');
  });
});
