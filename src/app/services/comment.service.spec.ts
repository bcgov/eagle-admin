import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, of } from 'rxjs';

import { CommentService } from './comment.service';
import { ConfigService } from './config.service';
import { DocumentService } from './document.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { Comment } from '../models/comment';
import { Document } from '../models/document';
import { DemiComment } from '../models/demi/comment';

const EAGLE_COMMENT = '5e0a6c1b2e3f4a5b6c7d8e01';
const EAGLE_PERIOD = '5d0a6c1b2e3f4a5b6c7d8e9f';

function nativeComment(overrides: Partial<DemiComment> = {}): DemiComment {
  return {
    id: EAGLE_COMMENT, eagleId: EAGLE_COMMENT, periodId: EAGLE_PERIOD, projectId: '207',
    projectEagleId: '588511d0aaecd9001b826192', sourceSystem: 'eagle', author: null, comment: 'Too loud',
    commentId: 7, dateAdded: null, dateUpdated: null, location: null, isAnonymous: true, submittedCAC: false,
    documents: [], eaoStatus: 'Pending', isPublished: false,
    ...overrides
  };
}

describe('CommentService', () => {
  let service: CommentService;
  let http: HttpTestingController;
  let documents: jasmine.SpyObj<DocumentService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: DocumentService, useValue: jasmine.createSpyObj('DocumentService', ['add', 'publish', 'unPublish']) }
      ]
    });
    service = TestBed.inject(CommentService);
    http = TestBed.inject(HttpTestingController);
    documents = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
  });

  afterEach(() => http.verify());

  describe('native reads', () => {
    it('lists a period\'s comments from /comments with every status as its own parameter', async () => {
      const result = firstValueFrom(service.listByPeriod(EAGLE_PERIOD, { eaoStatus: ['Pending', 'Deferred'], sort: '-dateAdded', page: 3 }));

      const req = http.expectOne(r => r.url === '/demi/api/comments');
      expect(req.request.params.get('period')).toBe(EAGLE_PERIOD);
      expect(req.request.params.getAll('eaoStatus')).toEqual(['Pending', 'Deferred']);
      expect(req.request.params.get('sort')).toBe('-dateAdded');
      expect(req.request.params.get('count')).toBe('true');
      req.flush([nativeComment()], { headers: { 'x-total-count': '41' } });

      expect((await result).total).toBe(41);
    });

    it('answers an empty page when the comment list fails', async () => {
      const result = firstValueFrom(service.listByPeriod(EAGLE_PERIOD));

      http.expectOne(r => r.url === '/demi/api/comments').flush({ error: 'boom' }, { status: 500, statusText: 'Error' });

      expect(await result).toEqual({ rows: [], total: 0 });
    });

    it('answers null when a comment cannot be read', async () => {
      const result = firstValueFrom(service.getNative(EAGLE_COMMENT));

      http.expectOne(`/demi/api/comments/${EAGLE_COMMENT}`).flush({ error: 'boom' }, { status: 500, statusText: 'Error' });

      expect(await result).toBeNull();
    });

    it('answers no next comment when the pending read fails', async () => {
      const result = firstValueFrom(service.getNextPending(EAGLE_PERIOD, { id: EAGLE_COMMENT, eaoStatus: 'Pending' }));

      http.expectOne(r => r.url === '/demi/api/comments').flush({ error: 'boom' }, { status: 500, statusText: 'Error' });

      expect(await result).toEqual({ nextId: null, pendingCount: 0 });
    });

    it('reads one comment from /comments/:id', async () => {
      const result = firstValueFrom(service.getNative(EAGLE_COMMENT));

      http.expectOne(`/demi/api/comments/${EAGLE_COMMENT}`).flush(nativeComment());

      expect((await result).comment).toBe('Too loud');
    });

    it('finds the next pending comment and counts the others from one count=true page', async () => {
      const result = firstValueFrom(service.getNextPending(EAGLE_PERIOD, { id: EAGLE_COMMENT, eaoStatus: 'Pending' }));

      const req = http.expectOne(r => r.url === '/demi/api/comments');
      expect(req.request.params.get('period')).toBe(EAGLE_PERIOD);
      expect(req.request.params.getAll('eaoStatus')).toEqual(['Pending']);
      expect(req.request.params.get('count')).toBe('true');
      expect(req.request.params.has('sort')).toBeFalse();
      req.flush([nativeComment(), nativeComment({ id: 'next' })], { headers: { 'x-total-count': '4' } });

      expect(await result).toEqual({ nextId: 'next', pendingCount: 3 });
    });

    it('counts every pending comment when the one on screen is not pending', async () => {
      const result = firstValueFrom(service.getNextPending(EAGLE_PERIOD, { id: EAGLE_COMMENT, eaoStatus: 'Published' }));

      http.expectOne(r => r.url === '/demi/api/comments')
        .flush([nativeComment({ id: 'first' })], { headers: { 'x-total-count': '1' } });

      expect(await result).toEqual({ nextId: 'first', pendingCount: 1 });
    });

    it('leaves the pending comment on screen out of the count when it is not in the page', async () => {
      const result = firstValueFrom(service.getNextPending(EAGLE_PERIOD, { id: EAGLE_COMMENT, eaoStatus: 'Pending' }));

      http.expectOne(r => r.url === '/demi/api/comments')
        .flush([nativeComment({ id: 'a' }), nativeComment({ id: 'b' })], { headers: { 'x-total-count': '5' } });

      expect(await result).toEqual({ nextId: 'a', pendingCount: 4 });
    });

    it('answers no next comment when the one on screen is the only pending one', async () => {
      const result = firstValueFrom(service.getNextPending(EAGLE_PERIOD, { id: EAGLE_COMMENT, eaoStatus: 'Pending' }));

      http.expectOne(r => r.url === '/demi/api/comments').flush([nativeComment()], { headers: { 'x-total-count': '1' } });

      expect(await result).toEqual({ nextId: null, pendingCount: 0 });
    });
  });

  describe('write body', () => {
    it('sends a legacy comment to eagle-api unchanged', () => {
      const legacy = new Comment({ _id: EAGLE_COMMENT, period: EAGLE_PERIOD, eaoStatus: 'Pending' });

      service.save(legacy).subscribe();

      const req = http.expectOne(`/api/comment/${EAGLE_COMMENT}`);
      expect(req.request.body).toEqual(JSON.parse(JSON.stringify(legacy)));
      req.flush({});
    });

    it('saves a native comment under its Eagle id with the Eagle period id', () => {
      service.save(nativeComment({ eaoNotes: 'checked' })).subscribe();

      const req = http.expectOne(`/api/comment/${EAGLE_COMMENT}`);
      expect(req.request.body._id).toBe(EAGLE_COMMENT);
      expect(req.request.body.period).toBe(EAGLE_PERIOD);
      expect(req.request.body.eaoNotes).toBe('checked');
      expect(req.request.body.periodId).toBeUndefined();
      req.flush({});
    });

    it('adds a native comment with the Eagle period id', () => {
      service.add(nativeComment({ id: undefined, eagleId: undefined })).subscribe();

      const req = http.expectOne('/api/comment/');
      expect(req.request.body.period).toBe(EAGLE_PERIOD);
      req.flush({});
    });

    it('refuses to add a comment to an ENGAGE period that is not in Eagle, uploading and sending nothing', async () => {
      const result = firstValueFrom(service.add(nativeComment({ periodId: 'engage-42' }), [new FormData()]));

      await expectAsync(result).toBeRejectedWithError(/not in Eagle/);
      expect(documents.add).not.toHaveBeenCalled();
      http.expectNone(() => true);
    });

    it('adds the uploaded document ids to a native comment without changing the caller\'s row', () => {
      documents.add.and.returnValue(of({ _id: 'doc1' } as any));
      const row = nativeComment({ id: undefined, eagleId: undefined });

      service.add(row, [new FormData()]).subscribe();

      const req = http.expectOne('/api/comment/');
      expect(req.request.body.documents).toEqual(['doc1']);
      expect(row.documents).toEqual([]);
      req.flush({});
    });

    it('adds the uploaded document ids to a legacy comment', () => {
      documents.add.and.returnValue(of({ _id: 'doc1' } as any));
      const legacy = new Comment({ _id: null, period: EAGLE_PERIOD, documents: [] });

      service.add(legacy, [new FormData()]).subscribe();

      const req = http.expectOne('/api/comment/');
      expect(req.request.body.documents).toEqual(['doc1']);
      expect(req.request.body.period).toBe(EAGLE_PERIOD);
      req.flush({});
    });

    it('publishes and unpublishes the reviewed documents, then returns the saved comment', async () => {
      documents.publish.and.returnValue(of(new Document()));
      documents.unPublish.and.returnValue(of(new Document()));
      const legacy = new Comment({ _id: EAGLE_COMMENT, period: EAGLE_PERIOD });
      legacy.documentsList = [
        new Document({ _id: 'shown', eaoStatus: 'Published' }), new Document({ _id: 'hidden', eaoStatus: 'Rejected' })
      ];

      const result = firstValueFrom(service.save(legacy));

      const req = http.expectOne(`/api/comment/${EAGLE_COMMENT}`);
      expect(req.request.body.documentsList).toBeNull();
      req.flush({ acknowledged: true });
      expect(documents.publish).toHaveBeenCalledWith('shown');
      expect(documents.unPublish).toHaveBeenCalledWith('hidden');
      expect(await result).toEqual({ acknowledged: true } as any);
    });

    it('sets a native comment\'s status under its Eagle id', () => {
      service.publish(nativeComment()).subscribe();

      const req = http.expectOne(`/api/comment/${EAGLE_COMMENT}/status`);
      expect(req.request.body).toEqual({ status: 'Published' });
      req.flush({});
    });
  });
});
