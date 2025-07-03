import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';

@Injectable()
export class ProjectNotificationDocumentsResolver {
  private searchService = inject(SearchService);
  private storageService = inject(StorageService);


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
