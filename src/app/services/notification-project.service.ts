import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { ProjectNotification } from '../models/projectNotification';

@Injectable()
export class NotificationProjectService {
  private projectNotificationList: ProjectNotification[] = [];
  constructor(private api: ApiService) { }


  // get all project notifications

  getAll(pageNum: number = 1, pageSize: number = 20, sortBy: string = null): Observable<Object> {
    return this.api.getProjectNotifications(pageNum, pageSize, sortBy)
      .map((res: any) => {
        if (res) {
          this.projectNotificationList = [];
          res.forEach(projectNotification => {
            this.projectNotificationList.push(new ProjectNotification(projectNotification));
          });
          return { totalCount: res.length, data: this.projectNotificationList };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  save(notificationProject: ProjectNotification, publish: boolean = null): Observable<ProjectNotification> {
    return this.api.saveNotificationProject(notificationProject, publish)
      .catch(error => this.api.handleError(error));
  }

  add(projectNotification: ProjectNotification, publish: boolean = false): Observable<ProjectNotification> {
    return this.api.addProjectNotification(projectNotification, publish)
      .catch(error => this.api.handleError(error));
  }
}
