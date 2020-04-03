import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { Topic } from 'app/models/topic';

@Injectable()
export class TopicService {

  readonly accepted = 'Accepted';
  readonly pending = 'Pending';
  readonly rejected = 'Rejected';

  constructor(
    private api: ApiService,
  ) { }

  // get all topics
  getAllTopics(pageNum: number = 1, pageSize: number = 10000, sortBy: string = null): Observable<Object> {
    return this.api.getTopics(pageNum, pageSize, sortBy)
      .map((res: Array<any>) => {
        if (res.length) {
          let topics: Array<Topic> = [];
          res[0].results.forEach(topic => {
            topics.push(new Topic(topic));
          });
          return { totalCount: res[0].total_items, data: topics };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  add(orig: Topic): Observable<Topic> {
    // make a (deep) copy of the passed-in topic so we don't change it
    const topic = _.cloneDeep(orig);

    // ID must not exist on POST
    delete topic._id;
    return this.api.addTopic(topic)
      .catch(error => this.api.handleError(error));
  }

  save(orig: Topic): Observable<Topic> {
    // make a (deep) copy of the passed-in topic so we don't change it
    const topic = _.cloneDeep(orig);

    return this.api.saveTopic(topic)
      .catch(error => this.api.handleError(error));
  }

  delete(orig: Topic): Observable<Topic> {
    // make a (deep) copy of the passed-in topic so we don't change it
    const topic = _.cloneDeep(orig);

    return this.api.deleteTopic(topic)
      .catch(error => this.api.handleError(error));
  }
}
