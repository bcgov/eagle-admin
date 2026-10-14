import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { DemiApiService } from './demi-api.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { ProjectNotification } from '../models/projectNotification';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { DemiNotification, LegacyNotification, legacyNotification, notificationSort } from '../models/demi/notification';

/** Loading-state key for the notifications table. */
export const NOTIFICATION_LIST_LOADING = 'project-notifications';

/**
 * Eagle write body for a notification. A body with `_id`, or a new one with no `id`, is Eagle-shaped and goes
 * unchanged; a native row is mapped. `associatedProjectId` already holds an Eagle project id in both shapes.
 */
export function toEagleNotification(body: ProjectNotification | LegacyNotification | DemiNotification): ProjectNotification | LegacyNotification {
  if ('_id' in body && body._id || !('id' in body)) {
    return body as ProjectNotification | LegacyNotification;
  }
  return legacyNotification(body);
}

@Injectable({ providedIn: 'root' })
export class NotificationProjectService {
  private api = inject(ApiService);
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

  /** One notification by its id (the Eagle id); null when it cannot be read. */
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

  save(pn: ProjectNotification | LegacyNotification | DemiNotification, publish: boolean = null): Observable<ProjectNotification> {
    const body = toEagleNotification(pn);
    let qs = `projectNotification/${body._id}`;
    if (publish !== null) { qs += `?publish=${publish}`; }
    return this.api.put<ProjectNotification>(qs, body).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  add(pn: ProjectNotification | DemiNotification, publish = false): Observable<ProjectNotification> {
    return this.api.post<ProjectNotification>(`projectNotification?publish=${publish}`, toEagleNotification(pn)).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}
