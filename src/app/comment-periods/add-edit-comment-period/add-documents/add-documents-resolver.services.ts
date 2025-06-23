import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';

@Injectable()
export class AddDocumentsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let projectId;
    const currentProject = this.storageService.state.currentProject;
    if (currentProject) {
      projectId = currentProject.data._id;
    } else {
      projectId = route.parent.parent.params.projId;
    }

    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : 1);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 10);
    const sortBy = route.queryParams['sortBy'] ? route.queryParams['sortBy'] : null;
    const keywords = route.params.keywords;

    let queryModifier = {};

    if (currentProject && currentProject.type === 'currentProjectNotification') {
      queryModifier = { documentSource: 'PROJECT-NOTIFICATION' };
    } else if (currentProject && currentProject.type === 'currentProject') {
      queryModifier = { documentSource: 'PROJECT' };
    }

    return this.searchService.getSearchResults(
      keywords,
      'Document',
      [{ 'name': 'project', 'value': projectId }],
      pageNum,
      pageSize,
      sortBy,
      queryModifier,
      false,
      {},
      '');
  }
}
