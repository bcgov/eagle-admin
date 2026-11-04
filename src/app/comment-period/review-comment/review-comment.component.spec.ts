import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ReviewCommentComponent } from './review-comment.component';
import { ReviewComment } from 'src/app/resolvers/comment.resolver';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { DemiDocument } from 'src/app/models/demi/document';

const COMMENT_ID = '59a0593a6356080019383e16';
const NEXT_ID = '59a0593a6356080019383e17';
const PERIOD_ID = '598b6eb61ecbc9001dfeba55';
const PARENT_ID = 'demi-notification-1';

function reviewComment(overrides: Partial<ReviewComment> = {}): ReviewComment {
  return {
    id: COMMENT_ID, eagleId: COMMENT_ID, periodId: PERIOD_ID, projectId: '207', projectEagleId: '588511d0aaecd9001b826192',
    sourceSystem: 'eagle', author: 'Pat', comment: 'Too loud', commentId: 12, dateAdded: '2017-08-25T00:00:00.000Z',
    dateUpdated: null, location: 'Victoria', isAnonymous: false, submittedCAC: false, documents: [],
    eaoStatus: 'Pending', isPublished: false, documentsList: [],
    ...overrides
  };
}

describe('ReviewCommentComponent', () => {
  let fixture: ComponentFixture<ReviewCommentComponent>;
  let http: HttpTestingController;
  let documents: jasmine.SpyObj<DocumentService>;
  let toast: jasmine.SpyObj<ToastService>;

  function create(comment: ReviewComment) {
    TestBed.configureTestingModule({
      imports: [ReviewCommentComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ notificationProjectId: PARENT_ID }) } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: DocumentService, useValue: jasmine.createSpyObj('DocumentService', ['publish', 'unPublish', 'downloadNative']) }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    documents = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture = TestBed.createComponent(ReviewCommentComponent);
    fixture.componentRef.setInput('project', { _id: null, name: 'Test' });
    fixture.componentRef.setInput('commentPeriod', { _id: PERIOD_ID });
    fixture.componentRef.setInput('commentPeriodId', PERIOD_ID);
    fixture.componentRef.setInput('comment', comment);
    fixture.detectChanges();
  }

  function nextPendingRequest(): TestRequest {
    return http.expectOne(req => req.url === '/demi/api/comments');
  }

  function answerNextPending(total: number) {
    nextPendingRequest().flush([{ id: COMMENT_ID }, { id: NEXT_ID }], { headers: { 'x-total-count': String(total) } });
    fixture.detectChanges();
  }

  function saveNextButton(): HTMLButtonElement | undefined {
    return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find(button => button.textContent.includes('Save/Next'));
  }

  afterEach(() => http.verify());

  it('asks DEMI for the period\'s pending comments with count=true', () => {
    create(reviewComment());

    const { params } = nextPendingRequest().request;
    expect(params.get('period')).toBe(PERIOD_ID);
    expect(params.getAll('eaoStatus')).toEqual(['Pending']);
    expect(params.get('count')).toBe('true');
  });

  it('shows how many other comments are pending, from x-total-count', () => {
    create(reviewComment());

    answerNextPending(3);

    expect(saveNextButton().textContent).toContain('Save/Next (2)');
  });

  it('hides Save/Next when no other comment is pending', () => {
    create(reviewComment());

    nextPendingRequest().flush([{ id: COMMENT_ID }], { headers: { 'x-total-count': '1' } });
    fixture.detectChanges();

    expect(saveNextButton()).toBeUndefined();
  });

  it('saves the review to DEMI under the row id, then opens the next pending comment', () => {
    create(reviewComment());
    answerNextPending(3);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.commentReviewForm.controls.isPublished.setValue(true);
    fixture.componentInstance.commentReviewForm.controls.publishedNotesText.setValue('Fine');

    saveNextButton().click();
    const put = http.expectOne(`/demi/api/comments/${COMMENT_ID}`);
    put.flush(reviewComment({ eaoStatus: 'Published' }));

    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual(jasmine.objectContaining({ eaoStatus: 'Published', publishedNotes: 'Fine' }));
    expect(navigate).toHaveBeenCalledWith(['/pn', PARENT_ID, 'cp', PERIOD_ID, 'c', NEXT_ID, 'comment-details']);
  });

  it('sends a cleared status as Pending', () => {
    create(reviewComment({ eaoStatus: 'Deferred' }));
    answerNextPending(1);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.commentReviewForm.controls.isDeferred.setValue(false);

    fixture.componentInstance.onSubmit('exit');

    expect(http.expectOne(`/demi/api/comments/${COMMENT_ID}`).request.body.eaoStatus).toBe('Pending');
  });

  it('publishes attachments by their Eagle id', () => {
    const attachment = { id: 'demi-doc', eagleId: '5a0000000000000000000001', eaoStatus: 'Published' } as DemiDocument;
    create(reviewComment({ documents: [attachment.eagleId], documentsList: [attachment] }));
    answerNextPending(1);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    documents.publish.and.returnValue(of(null));

    fixture.componentInstance.onSubmit('exit');
    http.expectOne(`/demi/api/comments/${COMMENT_ID}`).flush(reviewComment());

    expect(documents.publish).toHaveBeenCalledWith('5a0000000000000000000001');
  });

  it('shows and saves the next comment when Save/Next swaps the resolved comment', () => {
    create(reviewComment({ eaoStatus: 'Published', publishedNotes: 'Old' }));
    answerNextPending(3);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    fixture.componentRef.setInput('comment', reviewComment({ id: NEXT_ID, eagleId: NEXT_ID, commentId: 13, eaoStatus: 'Pending' }));
    fixture.detectChanges();
    answerNextPending(2);

    expect(fixture.componentInstance.commentReviewForm.controls.isPublished.value).toBeFalse();
    fixture.componentInstance.onSubmit('exit');
    expect(http.expectOne(`/demi/api/comments/${NEXT_ID}`).request.body.eaoStatus).toBe('Pending');
  });
  it('sends rejection notes as rejectedNotes, which the form reads back', () => {
    create(reviewComment());
    answerNextPending(1);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.setEaoStatus('Rejected');
    fixture.componentInstance.commentReviewForm.controls.rejectionNotesText.setValue('Off topic');

    fixture.componentInstance.onSubmit('exit');

    const { body } = http.expectOne(`/demi/api/comments/${COMMENT_ID}`).request;
    expect(body.rejectedNotes).toBe('Off topic');
    expect(body.eaoNotes).toBeUndefined();
  });

  it('a refused save stays on the page', () => {
    create(reviewComment());
    answerNextPending(1);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    fixture.componentInstance.onSubmit('exit');
    http.expectOne(`/demi/api/comments/${COMMENT_ID}`).flush(
      { error: 'Invalid request body.', fields: { body: 'must name at least one field' } },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(navigate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
