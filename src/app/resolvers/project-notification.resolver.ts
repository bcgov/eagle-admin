import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { map } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { NotificationProjectService } from '../services/notification-project.service';
import { StorageService } from '../services/storage.service';
import { LegacyNotification, legacyNotification } from '../models/demi/notification';

export const projectNotificationResolver: ResolveFn<LegacyNotification | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const notificationService = inject(NotificationProjectService);
  const storageService = inject(StorageService);
  const router = inject(Router);
  const id = route.paramMap.get('notificationProjectId')!;

  return notificationService.getNative(id).pipe(
    map(row => {
      if (!row) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      const notification = legacyNotification(row);
      // Detail, documents and the edit screen read the notification from here.
      storageService.state.currentProject = { type: 'currentProjectNotification', data: notification, docTotal: 0 };
      return notification;
    })
  );
};
