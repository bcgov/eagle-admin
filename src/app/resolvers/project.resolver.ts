import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { StorageService } from '../services/storage.service';
import { LegacyProject, toLegacyProject } from '../models/demi/project-legacy';

/** Loads the DEMI project for `:projId` (Eagle or DEMI id) as the legacy `Project` the screens read. */
export const projectResolver: ResolveFn<LegacyProject | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const projectService = inject(ProjectService);
  const storageService = inject(StorageService);
  const router = inject(Router);
  const projId = route.paramMap.get('projId')!;

  return projectService.getNative(projId).pipe(
    map(row => {
      if (!row) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      const project = toLegacyProject(row);
      // Keep storageService populated for backward compat with components not yet migrated
      storageService.state.currentProject = { type: 'currentProject', data: project };
      return project;
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
