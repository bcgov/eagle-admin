import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';

@Injectable()
export class ProjectNotificationDocumentsResolver implements Resolve<object> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let notificationProjectId = route.params['notificationProjectId'];
    const currentProject = this.storageService.state.currentProject ? this.storageService.state.currentProject.data : null;

    if (currentProject) {
      notificationProjectId = currentProject._id;
    }

    return this.searchService.getSearchResults(
      null,
      'Document',
      [],
      1,
      10,
      '-datePosted,+displayName',
      { documentSource: 'PROJECT-NOTIFICATION', project: notificationProjectId });
  }
}
