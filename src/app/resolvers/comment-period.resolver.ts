import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CommentPeriodService } from '../services/commentperiod.service';
import type { CommentPeriod } from '../models/commentPeriod';

export const commentPeriodResolver: ResolveFn<CommentPeriod | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const cpService = inject(CommentPeriodService);
  const router = inject(Router);
  const id = route.paramMap.get('commentPeriodId')!;

  return forkJoin([
    cpService.getSummaryById(id),
    cpService.getById(id)
  ]).pipe(
    map(([summary, cp]: [any, CommentPeriod | null]) => {
      if (!cp) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      // getById already constructs CommentPeriod — attach summary
      (cp as any).summary = summary;
      return cp;
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
