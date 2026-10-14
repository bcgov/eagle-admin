import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { DemiApiService } from './demi-api.service';
import { deferWrite } from './commentperiod.service';
import { DocumentService } from './document.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';

import { Comment } from '../models/comment';
import { Document } from '../models/document';
import { DemiComment, DemiCommentQuery, NextPendingComment } from '../models/demi/comment';
import { eagleWriteId, toEagleWriteBody } from '../models/demi/comment-period';
import { DemiList } from '../models/demi/demi-list';
import { isEagleId } from '../models/demi/demi-ids';

/** eagle-api POST/PUT body; see {@link toEagleWriteBody}. eagle-api reads the Eagle `period` id, never a project. */
function toEagleCommentBody(comment: Comment | DemiComment, isNew = false): any {
  // Mirrored periods keep their Eagle id as DEMI id; an ENGAGE period without one is not in Eagle.
  const period = '_id' in comment ? null : isEagleId(comment.periodId) ? comment.periodId : null;
  const body = toEagleWriteBody(comment, 'comment', { period }, isNew);
  if (body !== comment) {
    // Own array, so appending uploaded document ids leaves the caller's row alone.
    body.documents = [...(body.documents ?? [])];
  }
  return body;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private api = inject(ApiService);
  private demi = inject(DemiApiService);
  private documentService = inject(DocumentService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  public pendingCommentCount = 0;
  public nextCommentId = null;

  private readonly commentFields = [
    '_id', 'author', 'comment', 'commentId', 'dateAdded', 'dateUpdated',
    'documents', 'isAnonymous', 'location', 'eaoStatus', 'submittedCAC', 'period', 'read'
  ];

  private readonly commentDetailFields = [
    '_id', 'author', 'comment', 'commentId', 'dateAdded', 'datePosted', 'dateUpdated',
    'documents', 'eaoNotes', 'eaoStatus', 'submittedCAC', 'isAnonymous', 'location',
    'period', 'proponentNotes', 'proponentStatus', 'publishedNotes', 'rejectedNotes',
    'rejectedReason', 'read', 'write', 'delete'
  ];

  getCountByPeriodId(periodId: string): Observable<number> {
    const qs = `comment?isDeleted=false&commentStatus='Pending'&_commentPeriod=${periodId}`;
    return this.api.head(qs, { observe: 'response' }).pipe(
      withLoading(this.loadingState, `comment-count-${periodId}`),
      map((res: any) => parseInt(res.headers.get('x-total-count'), 10)),
      catchError(error => {
        this.logger.error(`Failed to get comment count for period ${periodId}`, 'CommentService', error);
        this.toast.error('Failed to load comment count.');
        return of(0);
      })
    );
  }

  getById(commentId: string, populateNextComment = false): Observable<Comment> {
    let qs = `comment/${commentId}?fields=${this.api.buildValues(this.commentDetailFields)}`;
    if (populateNextComment) { qs += '&populateNextComment=true'; }
    return this.api.get<any>(qs, { observe: 'response' }).pipe(
      withLoading(this.loadingState, `comment-${commentId}`),
      mergeMap((res: any) => {
        this.pendingCommentCount = res.headers.get('x-pending-comment-count');
        this.nextCommentId = res.headers.get('x-next-comment-id');
        const comments = res.body;
        if (!comments || comments.length === 0) {
          return of(null as Comment);
        }
        if (comments[0].documents === null || comments[0].documents && comments[0].documents.length === 0) {
          return of(new Comment(comments[0]));
        }
        return this._getExtraAppData(new Comment(comments[0]));
      }),
      catchError(error => {
        this.logger.error(`Failed to get comment ${commentId}`, 'CommentService', error);
        this.toast.error('Failed to load comment.');
        return of(null as Comment);
      })
    );
  }

  add(comment: Comment | DemiComment, documentForms: Array<FormData> = []): Observable<Comment> {
    return deferWrite(this.api, () => {
      // Mapped before any upload, so a comment eagle-api cannot take leaves no documents behind.
      const body = toEagleCommentBody(comment, true);
      if (!documentForms.length) {
        return this.api.post<Comment>('comment/', body);
      }
      return forkJoin(documentForms.map(form => this.documentService.add(form))).pipe(
        mergeMap((payload: any[]) => {
          payload.forEach((document: any) => body.documents.push(document._id));
          return this.api.post<Comment>('comment/', body);
        })
      );
    });
  }

  save(comment: Comment | DemiComment): Observable<Comment> {
    return deferWrite(this.api, () => {
      const documents: Document[] = ('documentsList' in comment && comment.documentsList) || [];
      if ('documentsList' in comment) {
        comment.documentsList = null;
      }
      const observables: Observable<any>[] = [];
      documents.forEach(document => {
        if (document.eaoStatus === 'Published') {
          observables.push(this.documentService.publish(document._id));
        } else if (document.eaoStatus === 'Rejected') {
          observables.push(this.documentService.unPublish(document._id));
        }
      });
      const newComment = toEagleCommentBody(JSON.parse(JSON.stringify(comment)));
      const put = this.api.put<Comment>(`comment/${newComment._id}`, newComment);
      return observables.length ? forkJoin([...observables, put]).pipe(map(payloads => payloads.pop())) : put;
    });
  }

  publish(comment: Comment | DemiComment): Observable<Comment> {
    return this.setStatus(comment, 'Published');
  }

  defer(comment: Comment | DemiComment): Observable<Comment> {
    return this.setStatus(comment, 'Deferred');
  }

  reject(comment: Comment | DemiComment): Observable<Comment> {
    return this.setStatus(comment, 'Rejected');
  }

  removeStatus(comment: Comment | DemiComment): Observable<Comment> {
    return this.setStatus(comment, 'Reset');
  }

  /** One page of a period's comments, with `total` from `count=true`. `periodId` is the period's DEMI `id`. */
  listByPeriod(periodId: string, query: DemiCommentQuery = {}): Observable<DemiList<DemiComment>> {
    const { eaoStatus, ...paging } = query;
    return this.demi.list<DemiComment>('comments', { ...paging, count: true, filters: { period: periodId, eaoStatus } }).pipe(
      withLoading(this.loadingState, `comments-by-period-native-${periodId}`),
      catchError(error => {
        this.logger.error(`Failed to get comments for period ${periodId}`, 'CommentService', error);
        this.toast.error('Failed to load comments.');
        return of({ rows: [], total: 0 });
      })
    );
  }

  /** One comment by DEMI or Eagle id, or null when it cannot be read. */
  getNative(commentId: string): Observable<DemiComment | null> {
    return this.demi.get<DemiComment>('comments', commentId).pipe(
      withLoading(this.loadingState, `comment-native-${commentId}`),
      catchError(error => {
        this.logger.error(`Failed to get comment ${commentId}`, 'CommentService', error);
        this.toast.error('Failed to load comment.');
        return of(null);
      })
    );
  }

  /**
   * The lowest-numbered pending comment of the period other than `current`, and how many pending comments there are
   * besides it, as eagle-api's `populateNextComment` gave them. `periodId` is the DEMI id; `current.eaoStatus` must be
   * the saved status. DEMI's default order is `commentId` ascending, so two rows always hold the answer.
   */
  getNextPending(periodId: string, current: Pick<DemiComment, 'id' | 'eaoStatus'>): Observable<NextPendingComment> {
    return this.demi.list<DemiComment>('comments', { pageSize: 2, count: true, filters: { period: periodId, eaoStatus: ['Pending'] } }).pipe(
      withLoading(this.loadingState, `comment-next-pending-${periodId}`),
      map(({ rows, total }) => ({
        nextId: rows.find(row => row.id !== current.id)?.id ?? null,
        pendingCount: Math.max(0, (total ?? 0) - (current.eaoStatus === 'Pending' ? 1 : 0))
      })),
      catchError(error => {
        this.logger.error(`Failed to get the next pending comment for period ${periodId}`, 'CommentService', error);
        return of({ nextId: null, pendingCount: 0 });
      })
    );
  }

  getByPeriodId(periodId: string, pageNum: number = null, pageSize: number = null, sortBy = '', count = true, filter: object = {}): Observable<object> {
    let qs = `comment?&period=${periodId}`;
    if (pageNum !== null) { qs += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { qs += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { qs += `&sortBy=${sortBy}`; }
    if (count !== null) { qs += `&count=${count}`; }
    Object.keys(filter).forEach(key => { qs += `&${key}=${filter[key]}`; });
    qs += `&fields=${this.api.buildValues(this.commentFields)}`;
    return this.api.get<any>(qs).pipe(
      withLoading(this.loadingState, `comments-by-period-${periodId}`),
      map((res: any) => {
        if (!res || res.length === 0) { return { totalCount: 0, data: [] }; }
        const comments = res[0].results.map((c: any) => new Comment(c));
        return { totalCount: res[0].total_items, data: comments };
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  private setStatus(comment: Comment | DemiComment, status: string): Observable<Comment> {
    return deferWrite(this.api, () => this.api.put<Comment>(`comment/${eagleWriteId(comment, 'comment')}/status`, { status }));
  }

  private _getExtraAppData(comment: Comment): Observable<Comment> {
    return forkJoin(
      this.documentService.getByMultiId(comment.documents)
    ).pipe(
      map(payloads => {
        comment.documentsList = payloads[0];
        return comment;
      })
    );
  }
}

