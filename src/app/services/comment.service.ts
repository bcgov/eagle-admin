import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, of, forkJoin } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

import { DemiApiService } from './demi-api.service';
import { DocumentService } from './document.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';

import { Document } from '../models/document';
import { DemiComment, DemiCommentQuery, NextPendingComment } from '../models/demi/comment';
import { DemiEaoStatus } from '../models/demi/comment-period';
import { DemiList } from '../models/demi/demi-list';

// DEMI's comment POST and PUT take only these (domain/comments.js CREATE_SCHEMA, UPDATE_SCHEMA); any other key is a 400.
const CREATE_FIELDS = [
  'periodId', 'author', 'comment', 'dateAdded', 'datePosted', 'documents', 'eaoNotes', 'eaoStatus', 'isAnonymous',
  'location', 'proponentNotes', 'proponentStatus', 'publishedNotes', 'rejectedNotes', 'rejectedReason', 'valuedComponents'
] as const;
const UPDATE_FIELDS = [
  'isAnonymous', 'datePosted', 'eaoNotes', 'eaoStatus', 'submittedCAC', 'proponentNotes', 'proponentStatus',
  'publishedNotes', 'rejectedNotes', 'rejectedReason'
] as const;

/** A new comment as DEMI's POST takes it; `periodId` is the period's DEMI id. */
export type CommentCreate = Partial<Pick<DemiComment, Exclude<typeof CREATE_FIELDS[number], 'periodId'>>> & { periodId: string };

/** An attachment whose publish state the review sets, by Eagle document id. */
export type ReviewedDocument = Pick<Document, '_id' | 'eaoStatus'>;

function pick(row: object, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(keys.filter(key => key in row).map(key => [key, (row as Record<string, unknown>)[key]]));
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private demi = inject(DemiApiService);
  private documentService = inject(DocumentService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  /**
   * Uploads the attachments to eagle-api, then creates the comment in DEMI with their ids in `documents`.
   * A refused add shows DEMI's message and completes with no value, so the form stays open.
   */
  add(comment: CommentCreate, documentForms: Array<FormData> = []): Observable<DemiComment> {
    const body = pick(comment, CREATE_FIELDS);
    const uploads$ = documentForms.length
      ? forkJoin(documentForms.map(form => this.documentService.add(form)))
      : of([] as Document[]);
    return uploads$.pipe(
      mergeMap(uploaded => this.demi.create<DemiComment>('comments', {
        ...body,
        ...(uploaded.length > 0 && { documents: [...(comment.documents ?? []), ...uploaded.map(document => document._id)] })
      })),
      catchError(error => this.writeFailed('add', error))
    );
  }

  /**
   * Writes the DEMI-writable fields of `comment` to the DEMI row `comment.id`, and sets each reviewed attachment's
   * publish state through eagle-api. Emits the saved row; fails as `add` does.
   */
  save(comment: Partial<DemiComment> & Pick<DemiComment, 'id'>, documents: ReviewedDocument[] = []): Observable<DemiComment> {
    const publishes = documents.flatMap(document => {
      if (document.eaoStatus === 'Published') {
        return [this.documentService.publish(document._id)];
      }
      return document.eaoStatus === 'Rejected' ? [this.documentService.unPublish(document._id)] : [];
    });
    const put = this.demi.update<DemiComment>('comments', comment.id, pick(comment, UPDATE_FIELDS));
    return (publishes.length ? forkJoin([...publishes, put]).pipe(map(payloads => payloads.pop() as DemiComment)) : put).pipe(
      catchError(error => this.writeFailed('save', error))
    );
  }

  publish(comment: Pick<DemiComment, 'id'>): Observable<DemiComment> {
    return this.setStatus(comment, 'Published');
  }

  defer(comment: Pick<DemiComment, 'id'>): Observable<DemiComment> {
    return this.setStatus(comment, 'Deferred');
  }

  reject(comment: Pick<DemiComment, 'id'>): Observable<DemiComment> {
    return this.setStatus(comment, 'Rejected');
  }

  /** DEMI stores `Reset` as `Pending`. */
  removeStatus(comment: Pick<DemiComment, 'id'>): Observable<DemiComment> {
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
   * Lowest-numbered pending comment of the period (DEMI `periodId`) other than `current`, and the pending count besides
   * it, as eagle-api's `populateNextComment` gave them. `current.eaoStatus` must be saved; DEMI sorts by `commentId`.
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

  private setStatus(comment: Pick<DemiComment, 'id'>, status: DemiEaoStatus | 'Reset'): Observable<DemiComment> {
    return this.demi.action<DemiComment>('comments', comment.id, 'status', { status }).pipe(
      catchError(error => this.writeFailed('update', error))
    );
  }

  private writeFailed(action: 'add' | 'save' | 'update', error: Error): Observable<never> {
    this.logger.error(`comment ${action} failed`, 'CommentService', error);
    this.toast.error(`Failed to ${action} comment. ${error.message}`);
    return EMPTY;
  }
}
