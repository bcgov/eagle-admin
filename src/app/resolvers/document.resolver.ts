import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { DocumentService } from '../services/document.service';
import type { DemiDocument } from '../models/demi/document';

/** Loads the DEMI document for `:docId` (DEMI or Eagle id) for the detail screen. */
export const documentResolver: ResolveFn<DemiDocument | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const documentService = inject(DocumentService);
  const router = inject(Router);
  const docId = route.paramMap.get('docId')!;

  return documentService.getNative(docId).pipe(
    map(doc => doc ?? new RedirectCommand(router.parseUrl('/search'))),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
