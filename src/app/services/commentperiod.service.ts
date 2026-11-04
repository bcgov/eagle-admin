import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';

import { DemiApiService } from './demi-api.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { CommentPeriod } from '../models/commentPeriod';
import { CommentPeriodSummary } from '../models/commentPeriodSummary';
import { DemiCommentPeriod, DemiCommentPeriodQuery, DemiCommentPeriodSummary } from '../models/demi/comment-period';
import { DemiList } from '../models/demi/demi-list';

// DEMI's comment period PUT and POST take only these (domain/comment-periods.js UPDATE_SCHEMA, LISTS,
// CREATE_SCHEMA); any other key is a 400.
const UPDATE_FIELDS = [
  'commentTip', 'dateCompleted', 'dateStarted', 'isMet', 'instructions', 'informationLabel', 'metURL', 'metBannerImageUrl',
  'milestone', 'openHouses', 'relatedDocuments'
] as const;
const CREATE_FIELDS = [...UPDATE_FIELDS, 'metURLAdmin', 'isPublished'] as const;
// DEMI refuses null in every other field; on a legacy period null means the field was never set.
const NULLABLE_FIELDS: readonly string[] = ['dateStarted', 'dateCompleted', 'milestone'];

/** A period a write targets. DEMI finds the row by its own id only, never the Eagle `_id`. */
type CommentPeriodRef = { demiId: string };

function writeBody(period: object, keys: readonly string[]): Record<string, unknown> {
  const row = period as Record<string, unknown>;
  return Object.fromEntries(keys
    .filter(key => row[key] !== undefined && (row[key] !== null || NULLABLE_FIELDS.includes(key)))
    .map(key => [key, row[key]]));
}

@Injectable({ providedIn: 'root' })
export class CommentPeriodService {
  private demi = inject(DemiApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  private readonly commentStatuses: Record<string, string> = {
    'Not Started': 'Commenting Not Started',
    'Not Open': 'Not Open For Commenting',
    'Closed': 'Commenting Closed',
    'Open': 'Commenting Open',
  };

  getSummaryById(periodId: string): Observable<CommentPeriodSummary> {
    return this.getNativeSummary(periodId).pipe(
      map(summary => summary ? new CommentPeriodSummary(summary.eaoStatus) : null)
    );
  }

  /** Periods of one DEMI project (or parent notification), with `total` from `count=true`. */
  listByProject(projectId: string, query: DemiCommentPeriodQuery = {}): Observable<DemiList<DemiCommentPeriod>> {
    const { status, ...paging } = query;
    return this.demi.list<DemiCommentPeriod>('comment-periods', { ...paging, count: true, filters: { project: projectId, status } }).pipe(
      withLoading(this.loadingState, `comment-periods-native-${projectId}`),
      catchError(error => {
        this.logger.error(`Failed to get comment periods for project ${projectId}`, 'CommentPeriodService', error);
        this.toast.error('Failed to load comment periods.');
        return of({ rows: [], total: 0 });
      })
    );
  }

  /** One period by DEMI or Eagle id, or null when it cannot be read. */
  getNative(periodId: string): Observable<DemiCommentPeriod | null> {
    return this.demi.get<DemiCommentPeriod>('comment-periods', periodId).pipe(
      withLoading(this.loadingState, `comment-period-native-${periodId}`),
      catchError(error => {
        this.logger.error(`Failed to get comment period ${periodId}`, 'CommentPeriodService', error);
        this.toast.error('Failed to load comment period.');
        return of(null);
      })
    );
  }

  /** Comment counts per EAO status, or null when the period cannot be read. */
  getNativeSummary(periodId: string): Observable<DemiCommentPeriodSummary | null> {
    // get() encodes its id argument, so the period id goes in the kind path and `summary` is the id segment.
    return this.demi.get<DemiCommentPeriodSummary>(`comment-periods/${encodeURIComponent(periodId)}`, 'summary').pipe(
      withLoading(this.loadingState, `comment-period-summary-${periodId}`),
      catchError(error => {
        this.logger.error(`Failed to get comment period summary ${periodId}`, 'CommentPeriodService', error);
        this.toast.error('Failed to load comment period summary.');
        return of(null);
      })
    );
  }

  /** Creates the period under `projectId`, the DEMI id of its project or parent notification. */
  add(period: Partial<CommentPeriod>, projectId: string): Observable<DemiCommentPeriod> {
    return this.demi.create<DemiCommentPeriod>('comment-periods', { ...writeBody(period, CREATE_FIELDS), projectId }).pipe(
      catchError(error => this.writeFailed('add', error))
    );
  }

  /**
   * Writes the fields DEMI's PUT takes. DEMI ignores `isPublished` there, so a changed published state goes in
   * `publish` and is set after the save.
   */
  save(period: Partial<CommentPeriod> & CommentPeriodRef, publish?: boolean): Observable<DemiCommentPeriod> {
    const saved$ = this.demi.update<DemiCommentPeriod>('comment-periods', period.demiId, writeBody(period, UPDATE_FIELDS)).pipe(
      catchError(error => this.writeFailed('save', error))
    );
    if (publish === undefined) {
      return saved$;
    }
    return saved$.pipe(mergeMap(() => this.setPublished(period, publish).pipe(
      catchError(error => {
        this.toast.error(`Comment period saved, but it was not ${publish ? 'published' : 'un-published'}. ${error.message}`);
        return throwError(() => error);
      })
    )));
  }

  delete(period: CommentPeriodRef): Observable<DemiCommentPeriod> {
    return this.demi.remove<DemiCommentPeriod>('comment-periods', period.demiId).pipe(
      catchError(error => this.writeFailed('delete', error))
    );
  }

  publish(period: CommentPeriodRef): Observable<DemiCommentPeriod> {
    return this.setPublished(period, true).pipe(catchError(error => this.writeFailed('publish', error)));
  }

  unPublish(period: CommentPeriodRef): Observable<DemiCommentPeriod> {
    return this.setPublished(period, false).pipe(catchError(error => this.writeFailed('un-publish', error)));
  }

  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    return (periods.length > 0) ? periods[0] : null;
  }

  getStatus(period: CommentPeriod): string {
    if (!period || !period.dateStarted || !period.dateCompleted) {
      return this.commentStatuses['Not Open'];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(period.dateStarted);
    const endDate = new Date(period.dateCompleted);
    if (endDate < today)     { return this.commentStatuses['Closed']; }
    else if (startDate > today) { return this.commentStatuses['Not Started']; }
    else                        { return this.commentStatuses['Open']; }
  }

  isNotOpen(period: CommentPeriod): boolean    { return this.getStatus(period) === this.commentStatuses['Not Open']; }
  isClosed(period: CommentPeriod): boolean      { return this.getStatus(period) === this.commentStatuses['Closed']; }
  isNotStarted(period: CommentPeriod): boolean  { return this.getStatus(period) === this.commentStatuses['Not Started']; }
  isOpen(period: CommentPeriod): boolean        { return this.getStatus(period) === this.commentStatuses['Open']; }

  private setPublished(period: CommentPeriodRef, publish: boolean): Observable<DemiCommentPeriod> {
    return this.demi.action<DemiCommentPeriod>('comment-periods', period.demiId, publish ? 'publish' : 'unpublish');
  }

  // Request errors are already logged by ApiService.handleError; the caller still sees the error to stop its spinner.
  private writeFailed(action: string, error: Error): Observable<never> {
    this.toast.error(`Failed to ${action} comment period. ${error.message}`);
    return throwError(() => error);
  }
}
