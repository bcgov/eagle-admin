import { inject } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CommentService } from '../services/comment.service';
import type { Comment } from '../models/comment';

export const commentResolver: ResolveFn<Comment | RedirectCommand> = (route: ActivatedRouteSnapshot) => {
  const commentService = inject(CommentService);
  const router = inject(Router);
  const id = route.paramMap.get('commentId')!;

  return commentService.getById(id, true).pipe(
    map((comment: Comment) => {
      if (!comment) {
        return new RedirectCommand(router.parseUrl('/search'));
      }
      return comment;
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/search'))))
  );
};
