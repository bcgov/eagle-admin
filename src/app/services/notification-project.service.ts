import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { NotificationProject } from 'app/models/notificationProject';

@Injectable()
export class NotificationProjectService {

  constructor(private api: ApiService) { }

  save(notificationProject: NotificationProject, publish: boolean = null): Observable<NotificationProject> {
    return this.api.saveNotificationProject(notificationProject, publish)
      .catch(error => this.api.handleError(error));
  }

  add(notificationProject: NotificationProject, publish: boolean = false): Observable<NotificationProject> {
    return this.api.addNotificationProject(notificationProject, publish)
      .catch(error => this.api.handleError(error));
  }
}
