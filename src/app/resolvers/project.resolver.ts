import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SearchService } from '../services/search.service';
import { StorageService } from '../services/storage.service';
import { extractFromSearchResults } from '../shared/utils/utils';
import type { Project } from '../models/project';
import type { ISearchResults } from '../models/search';

export const projectResolver: ResolveFn<Project | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const searchService = inject(SearchService);
  const storageService = inject(StorageService);
  const router = inject(Router);
  const projId = route.paramMap.get('projId')!;

  return searchService.getSearchResults('', 'Project', [], 1, 1, '', { _id: projId }, true, {}, '').pipe(
    map((data: ISearchResults<Project>[]) => {
      const results = extractFromSearchResults(data);
      const project = results?.[0] ?? null;
      if (!project) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      // Keep storageService populated for backward compat with components not yet migrated
      storageService.state.currentProject = { type: 'currentProject', data: project };
      return project;
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
