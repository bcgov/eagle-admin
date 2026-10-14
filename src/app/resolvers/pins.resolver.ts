import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { DemiProject } from '../models/demi/project';

/** The DEMI project row for `:projId`; the pins list reads `pins` and `pinsPublished` from it. */
export const pinsResolver: ResolveFn<DemiProject> = (route: ActivatedRouteSnapshot) => {
  const projectService = inject(ProjectService);
  const projectId = route.parent?.paramMap.get('projId') ?? '';
  return projectService.getNative(projectId);
};
