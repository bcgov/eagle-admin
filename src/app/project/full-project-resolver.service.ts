import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ProjectService } from '../services/project.service';
import { SearchService } from '../services/search.service';

@Injectable()
export class FullProjectResolver {

  constructor(
    private searchService: SearchService,
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const projId = route.pathFromRoot[1].paramMap.get('projId');
    return this.searchService.getSearchResults(
      '',
      'Project',
      [],
      1,
      1,
      '',
      { _id: projId },
      true,
      {},
      'all',
    ).pipe(
      mergeMap(data => this.projectService.getPeopleObjs(data))
    );
  }
}
