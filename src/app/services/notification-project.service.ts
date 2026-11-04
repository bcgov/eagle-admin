import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { DemiApiService } from './demi-api.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { ProjectNotification } from '../models/projectNotification';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { DemiNotification, legacyNotification, notificationSort } from '../models/demi/notification';

/** Loading-state key for the notifications table. */
export const NOTIFICATION_LIST_LOADING = 'project-notifications';

// DEMI's notification POST and PUT take only these; any other key is a 400 except `read` and
// `isPublished`, which PUT drops. A field PUT leaves out keeps its stored value.
const WRITABLE_FIELDS = [
  'name', 'type', 'subType', 'proponent', 'nature', 'region', 'location', 'trigger', 'decision', 'decisionDate',
  'notificationReceivedDate', 'description', 'notificationThresholdValue', 'notificationThresholdUnits',
  'associatedProjectId', 'associatedProjectName', 'dateStarted', 'dateCompleted', 'pcp', 'isMet', 'metURL', 'centroid'
] as const;

/** The notification fields a form writes; dates may be `Date`, which serializes to ISO. */
export type NotificationWrite = {
  [K in typeof WRITABLE_FIELDS[number]]?: K extends 'decisionDate' | 'notificationReceivedDate' | 'dateStarted' | 'dateCompleted'
    ? Date | string | null
    : DemiNotification[K];
};

// An undefined field is sent as null, so clearing a control clears the stored value.
function writeBody(fields: NotificationWrite): Record<string, unknown> {
  return Object.fromEntries(WRITABLE_FIELDS.filter(key => key in fields).map(key => [key, fields[key] ?? null]));
}

@Injectable({ providedIn: 'root' })
export class NotificationProjectService {
  private demiApi = inject(DemiApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  /** One page of notifications from DEMI. Filters: `type`, `region`, `pcp`, `decision`; sort: `name`, `notificationReceivedDate`. */
  listNative(params: DemiListParams = {}): Observable<DemiList<DemiNotification>> {
    return this.demiApi.list<DemiNotification>('notifications', params).pipe(
      withLoading(this.loadingState, NOTIFICATION_LIST_LOADING),
      catchError(error => {
        this.logger.error('Failed to get project notifications', 'NotificationProjectService', error);
        this.toast.error('Failed to load project notifications.');
        return of({ rows: [] as DemiNotification[] });
      })
    );
  }

  /** One notification by the route id, Eagle or DEMI; null when it cannot be read. */
  getNative(id: string): Observable<DemiNotification | null> {
    return this.demiApi.get<DemiNotification>('notifications', id).pipe(
      withLoading(this.loadingState, `project-notification-${id}`),
      catchError(error => {
        this.logger.error('Failed to get project notification', 'NotificationProjectService', error);
        return of(null);
      })
    );
  }

  getAll(pageNum = 1, pageSize = 20, sortBy: string = null): Observable<{ totalCount: number; data: ProjectNotification[] }> {
    return this.listNative({ page: pageNum ?? undefined, pageSize: pageSize ?? undefined, sort: notificationSort(sortBy) }).pipe(
      map(res => {
        const data = res.rows.map(row => new ProjectNotification(legacyNotification(row)));
        return { totalCount: data.length, data };
      })
    );
  }

  /**
   * PUTs `fields` to the DEMI row `demiId`, then publishes or unpublishes only when `publish` differs from the saved state.
   * A refused write shows DEMI's message and completes with no value, so the form stays open.
   */
  save(demiId: string, fields: NotificationWrite, publish: boolean | null = null): Observable<DemiNotification> {
    return this.demiApi.update<DemiNotification>('notifications', demiId, writeBody(fields)).pipe(
      catchError(error => this.writeFailed('save', error)),
      switchMap(row => publish === null || row.isPublished === publish ? of(row)
        : publish ? this.publish(demiId) : this.unpublish(demiId))
    );
  }

  /** Creates a notification, public when `publish` is true. Fails as `save` does. */
  add(fields: NotificationWrite, publish = false): Observable<DemiNotification> {
    return this.demiApi.create<DemiNotification>('notifications', { ...writeBody(fields), isPublished: publish }).pipe(
      catchError(error => this.writeFailed('add', error))
    );
  }

  /** Makes the notification public. Fails as `save` does. */
  publish(demiId: string): Observable<DemiNotification> {
    return this.setPublished(demiId, true).pipe(catchError(error => this.writeFailed('publish', error)));
  }

  /** Takes the notification off the public site. Fails as `save` does. */
  unpublish(demiId: string): Observable<DemiNotification> {
    return this.setPublished(demiId, false).pipe(catchError(error => this.writeFailed('unpublish', error)));
  }

  private setPublished(demiId: string, publish: boolean): Observable<DemiNotification> {
    return this.demiApi.action<DemiNotification>('notifications', demiId, publish ? 'publish' : 'unpublish');
  }

  private writeFailed(action: 'save' | 'add' | 'publish' | 'unpublish', error: Error): Observable<never> {
    this.toast.error(`Failed to ${action} project notification. ${error.message}`);
    return EMPTY;
  }
}
