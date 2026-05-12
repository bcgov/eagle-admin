import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { ProjectService } from '../services/project.service';

export const pinsResolver: ResolveFn<object> = (route: ActivatedRouteSnapshot) => {
  const projectService = inject(ProjectService);

  const projectId = route.parent?.paramMap.get('projId') ?? '';
  const pageNum = +(route.params['currentPage'] || 1);
  const pageSize = +(route.params['pageSize'] || 10);
  const sortBy = route.params['sortBy'] || '+name';

  return projectService.getPins(projectId, pageNum, pageSize, sortBy);
};
