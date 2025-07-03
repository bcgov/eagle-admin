import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CommentPeriodService } from '../services/commentperiod.service';


@Injectable()
export class CommentPeriodsResolver  {
  private commentPeriodService = inject(CommentPeriodService);


  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId') || route.parent.paramMap.get('notificationProjectId');
    const pageNum = route.params.pageNum ? route.params.pageNum : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy ? route.params.sortBy : '-dateStarted';

    // force-reload so we always have latest data
    return this.commentPeriodService.getAllByProjectId(projectId, pageNum, pageSize, sortBy);
  }
}
