import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CommentService } from '../services/comment.service';
import { DocumentService } from '../services/document.service';
import type { DemiComment } from '../models/demi/comment';
import type { DemiDocument } from '../models/demi/document';

/** A native comment with its attachments read from DEMI, as the comment review screen shows it. */
export type ReviewComment = DemiComment & { documentsList: DemiDocument[] };

export const commentResolver: ResolveFn<ReviewComment | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const commentService = inject(CommentService);
  const documentService = inject(DocumentService);
  const router = inject(Router);
  const id = route.paramMap.get('commentId')!;
  const notFound = () => new RedirectCommand(router.parseUrl('/search'));

  return commentService.getNative(id).pipe(
    switchMap(comment => {
      if (!comment) {
        return of(notFound());
      }
      const ids = comment.documents ?? [];
      const documents$ = ids.length ? documentService.byIdsNative(ids) : of([] as DemiDocument[]);
      return documents$.pipe(map(documentsList => ({ ...comment, documentsList })));
    }),
    catchError(() => of(notFound()))
  );
};
