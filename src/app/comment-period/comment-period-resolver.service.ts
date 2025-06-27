import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommentPeriodService } from '../services/commentperiod.service';
import { CommentPeriod } from '../models/commentPeriod';

@Injectable()
export class CommentPeriodResolver {

  constructor(
    private commentPeriodService: CommentPeriodService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    return forkJoin([
      from(this.commentPeriodService.getSummaryById(commentPeriodId)),
      from(this.commentPeriodService.getById(commentPeriodId))
    ]).pipe(
      map(([summary, commentPeriod]) => {
        commentPeriod.summary = summary;
        return new CommentPeriod(commentPeriod);
      })
    );
  }
}
