import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { ProjectService } from 'app/services/project.service';

@Injectable()
export class ProjectContactsGroupResolver implements Resolve<Observable<object>> {
  constructor(
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projId = route.parent.paramMap.get('projId');
    const groupId = route.paramMap.get('groupId');
    const pageNum = route.params.pageNum ? route.params.pageNum : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 25;
    const sortBy = route.params.sortBy ? route.params.sortBy : '+displayName';

    return this.projectService.getGroupMembers(projId, groupId, pageNum, pageSize, sortBy);
  }
}
