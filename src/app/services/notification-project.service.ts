import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { ProjectNotification } from '../models/projectNotification';

@Injectable()
export class NotificationProjectService {
  private api = inject(ApiService);

  private projectNotificationList: ProjectNotification[] = [];


  // get all project notifications

  getAll(pageNum = 1, pageSize = 20, sortBy: string = null): Observable<object> {
    return this.api.getProjectNotifications(pageNum, pageSize, sortBy).pipe(
      map((res: any) => {
        if (res) {
          this.projectNotificationList = [];
          res.forEach(projectNotification => {
            this.projectNotificationList.push(new ProjectNotification(projectNotification));
          });
          return { totalCount: res.length, data: this.projectNotificationList };
        }
        return {};
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  save(notificationProject: ProjectNotification, publish: boolean = null): Observable<ProjectNotification> {
    return this.api.saveNotificationProject(notificationProject, publish).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  add(projectNotification: ProjectNotification, publish = false): Observable<ProjectNotification> {
    return this.api.addProjectNotification(projectNotification, publish).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}
