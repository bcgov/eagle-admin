import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectService } from 'src/app/services/project.service';

@Injectable()
export class ProjectContactsGroupResolver {
  constructor(
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projId = route.parent.paramMap.get('projId');
    const groupId = route.paramMap.get('groupId');
    const pageNum = route.params.pageNum ? route.params.pageNum : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy ? route.params.sortBy : '+displayName';

    return this.projectService.getGroupMembers(projId, groupId, pageNum, pageSize, sortBy);
  }
}
