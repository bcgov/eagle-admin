import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { ProjectNotification } from '../models/projectNotification';

@Injectable({ providedIn: 'root' })
export class NotificationProjectService {
  private api = inject(ApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  private projectNotificationList: ProjectNotification[] = [];

  getAll(pageNum = 1, pageSize = 20, sortBy: string = null): Observable<object> {
    const fields = ['name', 'location', 'decisionDate'];
    let qs = `projectNotification?`;
    if (pageNum !== null) { qs += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { qs += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { qs += `sortBy=${sortBy}&`; }
    qs += `populate=true&fields=${this.api.buildValues(fields)}`;
    return this.api.get<any>(qs).pipe(
      withLoading(this.loadingState, 'project-notifications'),
      map((res: any) => {
        if (res) {
          this.projectNotificationList = res.map((pn: any) => new ProjectNotification(pn));
          return { totalCount: this.projectNotificationList.length, data: this.projectNotificationList };
        }
        return {};
      }),
      catchError(error => {
        this.logger.error('Failed to get project notifications', 'NotificationProjectService', error);
        this.toast.error('Failed to load project notifications.');
        return of({ totalCount: 0, data: [] });
      })
    );
  }

  save(pn: ProjectNotification, publish: boolean = null): Observable<ProjectNotification> {
    let qs = `projectNotification/${pn._id}`;
    if (publish !== null) { qs += `?publish=${publish}`; }
    return this.api.put<ProjectNotification>(qs, pn).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  add(pn: ProjectNotification, publish = false): Observable<ProjectNotification> {
    return this.api.post<ProjectNotification>(`projectNotification?publish=${publish}`, pn).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}
