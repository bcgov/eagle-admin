import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { ProjectNotification } from 'app/models/projectNotification';

@Injectable()
export class NotificationProjectService {

  constructor(private api: ApiService) { }

  save(notificationProject: ProjectNotification, publish: boolean = null): Observable<ProjectNotification> {
    return this.api.saveNotificationProject(notificationProject, publish)
      .catch(error => this.api.handleError(error));
  }

  add(projectNotification: ProjectNotification, publish: boolean = false): Observable<ProjectNotification> {
    return this.api.addProjectNotification(projectNotification, publish)
      .catch(error => this.api.handleError(error));
  }
}
