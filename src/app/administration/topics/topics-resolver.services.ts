import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { TopicService } from 'app/services/topic.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Injectable()
export class TopicsResolver implements Resolve<Object> {

  constructor(
    private topicService: TopicService,
    private tableTemplateUtils: TableTemplateUtils,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params);
    return this.topicService.getAllTopics(tableParams.currentPage, tableParams.pageSize, tableParams.sortBy);
  }
}
