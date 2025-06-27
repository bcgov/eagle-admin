import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../services/search.service';

@Injectable()
export class ProjectNotificationResolver  {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const notificationProjectId = route.paramMap.get('notificationProjectId');
    return this.searchService.getItem(notificationProjectId, 'ProjectNotification');
  }
}
