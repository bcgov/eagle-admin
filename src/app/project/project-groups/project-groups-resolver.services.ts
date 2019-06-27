import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { of } from 'rxjs';
import { ProjectService } from 'app/services/project.service';
import { containsTree } from '@angular/router/src/url_tree';
import { UserService } from 'app/services/user.service';

@Injectable()
export class ProjectContactsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = route.params.pageNum ? route.params.pageNum : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 25;
    const sortBy = route.params.sortBy ? route.params.sortBy : '+displayName';

    // force-reload so we always have latest data
    return this.searchService.getSearchResults(
      '',
      'Group',
      [],
      pageNum,
      pageSize,
      sortBy,
      { project: projectId },
      false);
  }
}
