import { Injectable, inject } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { DemiApiService } from './demi-api.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { CommentPeriod } from '../models/commentPeriod';
import { CommentPeriodSummary } from '../models/commentPeriodSummary';
import {
  DemiCommentPeriod, DemiCommentPeriodQuery, DemiCommentPeriodSummary, requireEagleWriteId, toEagleWriteBody
} from '../models/demi/comment-period';
import { DemiList } from '../models/demi/demi-list';
import { isEagleId } from '../models/demi/demi-ids';

/** eagle-api POST/PUT body; see {@link toEagleWriteBody}. `project` is the Eagle project id. */
function toEaglePeriodBody(period: CommentPeriod | DemiCommentPeriod, isNew = false): any {
  if ('_id' in period) {
    return period;
  }
  // A row read without staff fields lacks the key; saving it would blank them in Eagle.
  if (!('milestone' in period)) {
    throw new Error('This comment period was read without its staff fields and cannot be saved.');
  }
  // A notification-parented period's projectId is the notification id, which is also its Eagle id.
  const project = period.projectEagleId ?? (isEagleId(period.projectId) ? period.projectId : null);
  return toEagleWriteBody(period, 'comment period', { project }, isNew);
}

/** Runs a write lazily, so a body that cannot be mapped fails the returned stream instead of throwing at the call site. */
export function deferWrite<T>(api: ApiService, request: () => Observable<T>): Observable<T> {
  return defer(request).pipe(catchError(error => api.handleError(error)));
}

@Injectable({ providedIn: 'root' })
export class CommentPeriodService {
  private api = inject(ApiService);
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

  add(commentPeriod: CommentPeriod | DemiCommentPeriod): Observable<CommentPeriod> {
    return deferWrite(this.api, () => this.api.post<CommentPeriod>('commentperiod/', toEaglePeriodBody(commentPeriod, true)));
  }

  save(orig: CommentPeriod | DemiCommentPeriod): Observable<CommentPeriod> {
    return deferWrite(this.api, () => {
      const period = toEaglePeriodBody(JSON.parse(JSON.stringify(orig)));
      return this.api.put<CommentPeriod>(`commentperiod/${period._id}`, period);
    });
  }

  delete(period: CommentPeriod | DemiCommentPeriod): Observable<CommentPeriod> {
    return deferWrite(this.api, () => this.api.delete<CommentPeriod>(`commentperiod/${requireEagleWriteId(period, 'comment period')}`));
  }

  // eagle-api's publish routes read only the id, so a native row sends no body.
  publish(period: CommentPeriod | DemiCommentPeriod): Observable<CommentPeriod> {
    return deferWrite(this.api, () =>
      this.api.put<CommentPeriod>(`commentperiod/${requireEagleWriteId(period, 'comment period')}/publish`, '_id' in period ? period : {}));
  }

  unPublish(period: CommentPeriod | DemiCommentPeriod): Observable<CommentPeriod> {
    return deferWrite(this.api, () =>
      this.api.put<CommentPeriod>(`commentperiod/${requireEagleWriteId(period, 'comment period')}/unpublish`, '_id' in period ? period : {}));
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
}
