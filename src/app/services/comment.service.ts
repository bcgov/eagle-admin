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

// DEMI's string caps (domain/comments.js); checked here so a too-long comment uploads no attachments.
const MAX_LENGTHS: Record<string, number> = {
  comment: 50000, location: 1000, author: 500, proponentStatus: 500,
  eaoNotes: 10000, proponentNotes: 10000, publishedNotes: 10000, rejectedNotes: 10000, rejectedReason: 10000
};
const MAX_DOCUMENTS = 100;

/** A new comment as DEMI's POST takes it; `periodId` is the period's DEMI id. */
export type CommentCreate = Partial<Pick<DemiComment, Exclude<typeof CREATE_FIELDS[number], 'periodId'>>> & { periodId: string };

/** An attachment whose publish state the review sets, by Eagle document id. */
export type ReviewedDocument = Pick<Document, '_id' | 'eaoStatus'>;

function pick(row: object, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(keys.filter(key => key in row).map(key => [key, (row as Record<string, unknown>)[key]]));
}

function tooLong(body: Record<string, unknown>): string | null {
  const field = Object.keys(MAX_LENGTHS).find(key => typeof body[key] === 'string' && (body[key] as string).length > MAX_LENGTHS[key]);
  return field ? `${field}: must be at most ${MAX_LENGTHS[field]} characters` : null;
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
   * A refused add shows the reason and completes with no value, so the form stays open.
   */
  add(comment: CommentCreate, documentForms: Array<FormData> = []): Observable<DemiComment> {
    const body = pick(comment, CREATE_FIELDS);
    const refused = documentForms.length > MAX_DOCUMENTS ? `documents: at most ${MAX_DOCUMENTS} attachments` : tooLong(body);
    if (refused) {
      return this.writeFailed('add', new Error(refused));
    }
    const uploads$ = documentForms.length
      ? forkJoin(documentForms.map(form => this.documentService.add(form)))
      : of([] as Document[]);
    return uploads$.pipe(
      mergeMap(uploaded => this.demi.create<DemiComment>('comments', {
        ...body,
        ...(uploaded.length > 0 && { documents: uploaded.map(document => document._id) })
      })),
      catchError(error => this.writeFailed('add', error))
    );
  }

  /**
   * Writes the DEMI-writable fields to the row `comment.id`, then each attachment's publish state through eagle-api.
   * Emits the saved row; fails as `add` does, but names a failed attachment update after a saved PUT.
   */
  save(comment: Partial<DemiComment> & Pick<DemiComment, 'id'>, documents: ReviewedDocument[] = []): Observable<DemiComment> {
    return this.demi.update<DemiComment>('comments', comment.id, pick(comment, UPDATE_FIELDS)).pipe(
      mergeMap(saved => {
        const publishes = documents.flatMap(document => {
          if (document.eaoStatus === 'Published') {
            return [this.documentService.publish(document._id)];
          }
          return document.eaoStatus === 'Rejected' ? [this.documentService.unPublish(document._id)] : [];
        });
        if (!publishes.length) {
          return of(saved);
        }
        return forkJoin(publishes).pipe(
          map(() => saved),
          catchError(error => {
            this.toast.error(`Comment saved, but its attachments were not updated. ${error.message}`);
            return EMPTY;
          })
        );
      }),
      catchError(error => this.writeFailed('save', error))
    );
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

  // Request errors are already logged by ApiService.handleError.
  private writeFailed(action: 'add' | 'save', error: Error): Observable<never> {
    this.toast.error(`Failed to ${action} comment. ${error.message}`);
    return EMPTY;
  }
}
