import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
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
const PROJECT_ID = '588511d0aaecd9001b826192';

function reviewComment(overrides: Partial<ReviewComment> = {}): ReviewComment {
  return {
    id: COMMENT_ID, eagleId: COMMENT_ID, periodId: PERIOD_ID, projectId: '207', projectEagleId: PROJECT_ID,
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

  function create(comment: ReviewComment) {
    TestBed.configureTestingModule({
      imports: [ReviewCommentComponent],
      providers: [
        provideRouter([]),
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
    fixture = TestBed.createComponent(ReviewCommentComponent);
    fixture.componentRef.setInput('project', { _id: PROJECT_ID, name: 'Test' });
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

  it('saves the review to eagle-api under the Eagle id, then opens the next pending comment', () => {
    create(reviewComment());
    answerNextPending(3);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.commentReviewForm.controls.isPublished.setValue(true);
    fixture.componentInstance.commentReviewForm.controls.publishedNotesText.setValue('Fine');

    saveNextButton().click();
    const put = http.expectOne(`/api/comment/${COMMENT_ID}`);
    put.flush({ acknowledged: true });

    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual(jasmine.objectContaining({ _id: COMMENT_ID, eaoStatus: 'Published', publishedNotes: 'Fine' }));
    expect(put.request.body.periodId).toBeUndefined();
    expect(navigate).toHaveBeenCalledWith(['/pn', PROJECT_ID, 'cp', PERIOD_ID, 'c', NEXT_ID, 'comment-details']);
  });

  it('sends a cleared status as Pending', () => {
    create(reviewComment({ eaoStatus: 'Deferred' }));
    answerNextPending(1);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.commentReviewForm.controls.isDeferred.setValue(false);

    fixture.componentInstance.onSubmit('exit');

    expect(http.expectOne(`/api/comment/${COMMENT_ID}`).request.body.eaoStatus).toBe('Pending');
  });

  it('publishes attachments by their Eagle id', () => {
    const attachment = { id: 'demi-doc', eagleId: '5a0000000000000000000001', eaoStatus: 'Published' } as DemiDocument;
    create(reviewComment({ documents: [attachment.eagleId], documentsList: [attachment] }));
    answerNextPending(1);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    documents.publish.and.returnValue(of(null));

    fixture.componentInstance.onSubmit('exit');
    http.expectOne(`/api/comment/${COMMENT_ID}`).flush({});

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
    expect(http.expectOne(`/api/comment/${NEXT_ID}`).request.body.eaoStatus).toBe('Pending');
  });
});
