import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { AddCommentComponent } from './add-comment.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';

const ROUTE_PERIOD_ID = '598b6eb61ecbc9001dfeba55';
const DEMI_PERIOD_ID = '0b9a4f8e-6c1d-4f2a-9e3b-7d5c2a1f0e44';

describe('AddCommentComponent', () => {
  let fixture: ComponentFixture<AddCommentComponent>;
  let http: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  function setPeriod(readOnly: boolean) {
    fixture.componentRef.setInput('commentPeriod',
      { _id: ROUTE_PERIOD_ID, demiId: DEMI_PERIOD_ID, readOnly, dateStarted: '2026-01-01', dateCompleted: '2026-02-01' });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommentComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ projId: 'p1' }) } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: DocumentService, useValue: jasmine.createSpyObj('DocumentService', ['add']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error']) }
      ]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture = TestBed.createComponent(AddCommentComponent);
    fixture.componentRef.setInput('project', { _id: null, name: 'Test Project' });
    setPeriod(false);
    fixture.componentRef.setInput('commentPeriodId', ROUTE_PERIOD_ID);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('renders the file picker browse button', () => {
    const browse: HTMLButtonElement = fixture.nativeElement.querySelector('app-file-upload button.browse');
    expect(browse).not.toBeNull();
    expect(browse.type).toBe('button');
    expect(browse.textContent).toContain('browse');
  });

  it('add POSTs periodId = the period\'s demiId, not the route id', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.addCommentForm.controls.commentText.setValue('Too loud');

    fixture.componentInstance.onSubmit();

    const req = http.expectOne('/demi/api/comments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.periodId).toBe(DEMI_PERIOD_ID);
    req.flush({ id: 'new' });
    expect(navigate).toHaveBeenCalledWith(['/p', 'p1', 'cp', ROUTE_PERIOD_ID]);
  });
  it('sends rejection notes as rejectedNotes', () => {
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.setEaoStatus('Rejected');
    fixture.componentInstance.addCommentForm.controls.rejectionNotesText.setValue('Off topic');

    fixture.componentInstance.onSubmit();

    const req = http.expectOne('/demi/api/comments');
    expect(req.request.body.rejectedNotes).toBe('Off topic');
    expect(req.request.body.eaoNotes).toBeUndefined();
    req.flush({ id: 'new' });
  });

  it('a refused add stays on the form', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    fixture.componentInstance.onSubmit();
    http.expectOne('/demi/api/comments').flush(
      { error: 'Invalid request body.', fields: { periodId: 'must name a comment period' } },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(navigate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('refuses to add a comment to a read-only period, sending nothing', () => {
    setPeriod(true);

    fixture.componentInstance.onSubmit();

    http.expectNone(() => true);
    expect(toast.error).toHaveBeenCalledWith('Failed to add comment. This comment period is read-only.');
  });
});
