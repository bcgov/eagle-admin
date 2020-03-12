import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';
import { forkJoin, of, from } from 'rxjs';
import { CommentPeriod } from 'app/models/commentPeriod';

@Injectable()
export class CommentPeriodResolver implements Resolve<Object> {

  constructor(
    private commentPeriodService: CommentPeriodService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    // force-reload so we always have latest data
    return forkJoin(
      from(this.commentPeriodService.getSummaryById(commentPeriodId)),
      from(this.commentPeriodService.getById(commentPeriodId))
    ).map(([summary, commentPeriod]) => {
      commentPeriod.summary = summary;
      return new CommentPeriod(commentPeriod);
    });
  }
}
