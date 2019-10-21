import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';
import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectResolver implements Resolve<Object> {

  constructor(
    private projectService: ProjectService,
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const projId = route.paramMap.get('projId');
    let start = new Date();
    let end = new Date();
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    return this.searchService.getSearchResults(
      '',
      'Project',
      [],
      1,
      1,
      '',
      '',
      {_id: projId},
      true,
      {}
    );
  }
}
