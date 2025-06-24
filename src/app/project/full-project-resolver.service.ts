import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ProjectService } from '../services/project.service';
import { SearchService } from '../services/search.service';

@Injectable()
export class FullProjectResolver implements Resolve<Object> {

  constructor(
    private searchService: SearchService,
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const projId = route.pathFromRoot[1].paramMap.get('projId');
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    return this.searchService.getSearchResults(
      '',
      'Project',
      [],
      1,
      1,
      '',
      {_id: projId},
      true,
      {},
      'all',
    ).flatMap(data => this.projectService.getPeopleObjs(data));
    // Mapping the get People object observable here to fill out the epd and lead objects
  }
}
