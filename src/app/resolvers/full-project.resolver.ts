import { inject } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { SearchService } from '../services/search.service';

export const fullProjectResolver: ResolveFn<object> = (route: ActivatedRouteSnapshot) => {
  const searchService = inject(SearchService);
  const projectService = inject(ProjectService);

  const projId = route.pathFromRoot.find(r => r.paramMap.has('projId'))?.paramMap.get('projId') ?? '';

  return searchService.getSearchResults('', 'Project', [], 1, 1, '', { _id: projId }, true, {}, 'all')
    .pipe(mergeMap(data => projectService.getPeopleObjs(data)));
};
