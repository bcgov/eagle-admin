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
import { requireEagleWriteId, toEagleWriteBody } from '../models/demi/comment-period';
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

  private setStatus(comment: Comment | DemiComment, status: string): Observable<Comment> {
    return deferWrite(this.api, () => this.api.put<Comment>(`comment/${requireEagleWriteId(comment, 'comment')}/status`, { status }));
  }
}

