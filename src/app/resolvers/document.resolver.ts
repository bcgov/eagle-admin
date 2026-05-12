import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { DocumentService } from '../services/document.service';
import type { Document } from '../models/document';

export const documentResolver: ResolveFn<Document | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const documentService = inject(DocumentService);
  const router = inject(Router);
  const docId = route.paramMap.get('docId')!;

  return documentService.getById(docId, true).pipe(
    map((doc: Document | null) => {
      if (!doc) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      return doc;
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
