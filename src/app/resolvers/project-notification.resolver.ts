import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SearchService } from '../services/search.service';
import { StorageService } from '../services/storage.service';

export const projectNotificationResolver: ResolveFn<any | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const searchService = inject(SearchService);
  const storageService = inject(StorageService);
  const router = inject(Router);
  const id = route.paramMap.get('notificationProjectId')!;

  return searchService.getItem(id, 'ProjectNotification').pipe(
    map((res: any) => {
      if (!res?.data) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      // Keep storageService populated for backward compat with components not yet migrated
      storageService.state.currentProject = { type: 'currentProjectNotification', data: res.data, docTotal: 0 };
      return res.data;
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
