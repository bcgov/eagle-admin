import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CommentPeriodService } from '../services/commentperiod.service';
import { KeycloakService } from '../services/keycloak.service';
import { LegacyCommentPeriod, toLegacyCommentPeriod } from '../comment-periods/comment-period-legacy';

/** Loads the DEMI period for `:commentPeriodId` (Eagle or DEMI id) as the legacy `CommentPeriod` the screens read. */
export const commentPeriodResolver: ResolveFn<LegacyCommentPeriod | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const cpService = inject(CommentPeriodService);
  const keycloak = inject(KeycloakService);
  const router = inject(Router);
  const id = route.paramMap.get('commentPeriodId')!;

  return forkJoin([
    cpService.getSummaryById(id),
    cpService.getNative(id)
  ]).pipe(
    map(([summary, row]) => {
      if (!row) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      const roles: string[] = keycloak.getToken() ? keycloak.getUserRoles() ?? [] : [];
      return Object.assign(toLegacyCommentPeriod(row, roles), { summary });
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
