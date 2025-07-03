import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from '../services/search.service';

@Injectable()
export class ProjectNotificationResolver  {
  private searchService = inject(SearchService);


  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const notificationProjectId = route.paramMap.get('notificationProjectId');
    return this.searchService.getItem(notificationProjectId, 'ProjectNotification');
  }
}
