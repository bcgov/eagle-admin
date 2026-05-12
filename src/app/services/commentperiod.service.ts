import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { CommentPeriod } from '../models/commentPeriod';
import { CommentPeriodSummary } from '../models/commentPeriodSummary';

const PERIOD_FIELDS = [
  '_id', '__v', '_schemaName', 'addedBy', 'additionalText', 'ceaaAdditionalText',
  'ceaaInformationLabel', 'ceaaRelatedDocuments', 'classificationRoles', 'classifiedPercent',
  'commenterRoles', 'commentTip', 'dateAdded', 'dateCompleted', 'dateCompletedEst',
  'dateStarted', 'dateStartedEst', 'dateUpdated', 'downloadRoles', 'informationLabel',
  'instructions', 'isClassified', 'isPublished', 'isResolved', 'isVetted', 'milestone',
  'openCommentPeriod', 'openHouses', 'periodType', 'phase', 'phaseName', 'project',
  'publishedPercent', 'rangeOption', 'rangeType', 'relatedDocuments', 'resolvedPercent',
  'updatedBy', 'userCan', 'vettedPercent', 'vettingRoles'
];

@Injectable({ providedIn: 'root' })
export class CommentPeriodService {
  private api = inject(ApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  private readonly commentStatuses: Record<string, string> = {
    'Not Started': 'Commenting Not Started',
    'Not Open': 'Not Open For Commenting',
    'Closed': 'Commenting Closed',
    'Open': 'Commenting Open',
  };

  getAllByProjectId(projId: string, pageNum = 1, pageSize = 10, sortBy: string = null): Observable<object> {
    const fields = ['project', 'dateStarted', 'dateCompleted', 'isMet', 'metURLAdmin'];
    let qs = `commentperiod?&project=${projId}&`;
    if (pageNum !== null) { qs += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { qs += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { qs += `sortBy=${sortBy}&`; }
    qs += `count=true&fields=${this.api.buildValues(fields)}`;
    return this.api.get<any>(qs).pipe(
      withLoading(this.loadingState, `comment-periods-${projId}`),
      map((res: any) => {
        if (!res || res.length === 0) { return { totalCount: 0, data: [] }; }
        const periods = res[0].results.map((cp: any) => new CommentPeriod(cp));
        return { totalCount: res[0].total_items, data: periods };
      }),
      catchError(error => {
        this.logger.error(`Failed to get comment periods for project ${projId}`, 'CommentPeriodService', error);
        this.toast.error('Failed to load comment periods.');
        return of({ totalCount: 0, data: [] });
      })
    );
  }

  getById(periodId: string): Observable<CommentPeriod> {
    return this.api.get<CommentPeriod[]>(`commentperiod/${periodId}?fields=${this.api.buildValues(PERIOD_FIELDS)}`).pipe(
      withLoading(this.loadingState, `comment-period-${periodId}`),
      map((res: any) => res?.length ? new CommentPeriod(res[0]) : null),
      catchError(error => {
        this.logger.error(`Failed to get comment period ${periodId}`, 'CommentPeriodService', error);
        this.toast.error('Failed to load comment period.');
        return of(null as CommentPeriod);
      })
    );
  }

  getSummaryById(periodId: string): Observable<CommentPeriodSummary> {
    return this.api.get<CommentPeriodSummary>(`commentperiod/${periodId}/summary`).pipe(
      withLoading(this.loadingState, `comment-period-summary-${periodId}`),
      map((res: any) => res ? new CommentPeriodSummary(res) : null),
      catchError(error => {
        this.logger.error(`Failed to get comment period summary ${periodId}`, 'CommentPeriodService', error);
        this.toast.error('Failed to load comment period summary.');
        return of(null as CommentPeriodSummary);
      })
    );
  }

  add(commentPeriod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.post<CommentPeriod>('commentperiod/', commentPeriod).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  save(orig: CommentPeriod): Observable<CommentPeriod> {
    const period = JSON.parse(JSON.stringify(orig));
    return this.api.put<CommentPeriod>(`commentperiod/${period._id}`, period).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  delete(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.delete<CommentPeriod>(`commentperiod/${period._id}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.put<CommentPeriod>(`commentperiod/${period._id}/publish`, period).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unPublish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.put<CommentPeriod>(`commentperiod/${period._id}/unpublish`, period).pipe(
      catchError(error => this.api.handleError(error))
    );
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
