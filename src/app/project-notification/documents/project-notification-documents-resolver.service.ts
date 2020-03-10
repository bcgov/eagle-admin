import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectNotificationDocumentsResolver implements Resolve<object> {
  constructor(
    private searchService: SearchService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const notificationProjectId = route.paramMap.get('notificationProjectId');
    return this.searchService.getSearchResults(
      null,
      'Document',
      [],
      1,
      1000,
      null,
      { documentSource: 'PROJECT-NOTIFICATION', project: notificationProjectId });
  }
}
