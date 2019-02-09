import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodsResolver implements Resolve<CommentPeriod[]> {

  constructor(
    private commentPeriodService: CommentPeriodService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CommentPeriod[]> {
    const projectId = route.paramMap.get('projId');
    // force-reload so we always have latest data
    return this.commentPeriodService.getAllByProjectId(projectId);
  }
}
