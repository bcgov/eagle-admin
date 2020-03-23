import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { TopicService } from 'app/services/topic.service';

@Injectable()
export class TopicResolver implements Resolve<Observable<object>> {
  constructor(
    private topicService: TopicService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : 1);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 1000);
    return this.topicService.getAllTopics(pageNum, pageSize);
  }
}
