import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, RouterStateSnapshot, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';

import { commentResolver, ReviewComment } from './comment.resolver';
import { CommentService } from '../services/comment.service';
import { DocumentService } from '../services/document.service';
import { DemiComment } from '../models/demi/comment';
import { DemiDocument } from '../models/demi/document';

const COMMENT_ID = '59a0593a6356080019383e16';
const PERIOD_ID = '598b6eb61ecbc9001dfeba55';

function nativeComment(overrides: Partial<DemiComment> = {}): DemiComment {
  return {
    id: COMMENT_ID, periodId: PERIOD_ID, projectId: '207', author: 'Pat', comment: 'Too loud', commentId: 12,
    dateAdded: '2017-08-25T00:00:00.000Z', dateUpdated: null, location: 'Victoria', isAnonymous: false,
    submittedCAC: false, documents: [], eaoStatus: 'Pending', isPublished: false,
    ...overrides
  };
}

describe('commentResolver', () => {
  let comments: jasmine.SpyObj<CommentService>;
  let documents: jasmine.SpyObj<DocumentService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CommentService, useValue: jasmine.createSpyObj('CommentService', ['getNative']) },
        { provide: DocumentService, useValue: jasmine.createSpyObj('DocumentService', ['byIdsNative']) }
      ]
    });
    comments = TestBed.inject(CommentService) as jasmine.SpyObj<CommentService>;
    documents = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
  });

  function resolve(): Promise<ReviewComment | RedirectCommand> {
    const route = { paramMap: convertToParamMap({ commentId: COMMENT_ID }) } as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(commentResolver(route, {} as RouterStateSnapshot) as Observable<ReviewComment | RedirectCommand>));
  }

  it('gives the native comment with its attachments read from DEMI', async () => {
    comments.getNative.and.returnValue(of(nativeComment({ documents: ['d1', 'd2'] })));
    documents.byIdsNative.and.returnValue(of([{ id: 'd1' }, { id: 'd2' }] as DemiDocument[]));

    const result = await resolve() as ReviewComment;

    expect(comments.getNative).toHaveBeenCalledWith(COMMENT_ID);
    expect(documents.byIdsNative).toHaveBeenCalledWith(['d1', 'd2']);
    expect(result.id).toBe(COMMENT_ID);
    expect(result.periodId).toBe(PERIOD_ID);
    expect(result.documentsList.map(document => document.id)).toEqual(['d1', 'd2']);
  });

  it('gives an empty attachment list without a document read when the comment has none', async () => {
    comments.getNative.and.returnValue(of(nativeComment()));

    const result = await resolve() as ReviewComment;

    expect(result.documentsList).toEqual([]);
    expect(documents.byIdsNative).not.toHaveBeenCalled();
  });

  it('redirects to search when the comment cannot be read', async () => {
    comments.getNative.and.returnValue(of(null));

    const result = await resolve();

    expect(result instanceof RedirectCommand).toBeTrue();
    expect((result as RedirectCommand).redirectTo.toString()).toBe('/search');
  });
});
