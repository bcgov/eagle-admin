import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { StorageService } from 'app/services/storage.service';
import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectNotificationDocumentsResolver implements Resolve<object> {
  constructor(
    private searchService: SearchService,
    private storageService:  StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let notificationProjectId = route.params['notificationProjectId'];
    const currentProject = this.storageService.state.currentProject;

    if (currentProject) {
      notificationProjectId = currentProject._id;
    }

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
