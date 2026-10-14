import { inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { isEagleId } from '../models/demi/demi-ids';
import { SearchResults } from '../models/search';
import { ApiService } from '../services/api';
import { LoggingService } from '../services/logging.service';
import { ProjectService } from '../services/project.service';
import { ToastService } from '../services/toast.service';

const noResults = () => [new SearchResults({ data: { searchResults: [], meta: [{ searchResultsTotal: 0 }] } })];

/**
 * Every legislation version of the project (`legislation_<year>`), from eagle-api search, for the detail,
 * archived-detail and edit screens. Stays on eagle-api until DEMI rows carry every legislation version.
 */
export const fullProjectResolver: ResolveFn<object> = (route: ActivatedRouteSnapshot) => {
  const api = inject(ApiService);
  const projectService = inject(ProjectService);
  const logger = inject(LoggingService);
  const toast = inject(ToastService);

  const projId = route.pathFromRoot.find(r => r.paramMap.has('projId'))?.paramMap.get('projId') ?? '';
  // Track-only projects arrive by DEMI id and have no eagle-api record to read.
  if (!isEagleId(projId)) {
    return of(noResults());
  }
  const qs = `search?dataset=Project&pageNum=0&pageSize=1&projectLegislation=all&populate=true&and%5B_id%5D=${projId}`;

  return api.get<object[]>(qs).pipe(
    map(rows => rows.map(row => new SearchResults({ data: row }))),
    catchError(error => {
      logger.error('Failed to load project', 'fullProjectResolver', error);
      toast.error('Failed to load project.');
      return of(noResults());
    }),
    mergeMap(data => projectService.getPeopleObjs(data))
  );
};
