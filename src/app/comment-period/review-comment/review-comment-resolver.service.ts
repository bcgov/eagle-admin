import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CommentService } from 'src/app/services/comment.service';

@Injectable()
export class ReviewCommentResolver  {
  private commentService = inject(CommentService);


  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const commentId = route.paramMap.get('commentId');

    // force-reload so we always have latest data
    return this.commentService.getById(commentId, true);
  }
}
