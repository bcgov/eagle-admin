import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectNotificationResolver implements Resolve<object> {
  constructor(
    private searchService: SearchService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const notificationProjectId = route.paramMap.get('notificationProjectId');
    return this.searchService.getItem(notificationProjectId, 'NotificationProject');
  }
}
