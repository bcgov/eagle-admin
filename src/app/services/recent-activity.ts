import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { RecentActivity } from 'app/models/recentActivity';

@Injectable()
export class RecentActivityService {

  constructor(private api: ApiService) { }

  // MBL TODO: PUT/POST functionality.
  add(activity: RecentActivity) {
    return this.api.addRecentActivity(activity)
    .map(res => {
      if (res) {
        return new RecentActivity(res);
      }
      return [];
    })
    .catch(error => this.api.handleError(error));
  }

  save(activity: RecentActivity) {
    return this.api.saveRecentActivity(activity)
    .map(res => {
      if (res) {
        return new RecentActivity(res);
      }
      return [];
    })
    .catch(error => this.api.handleError(error));
  }

  delete(activity: RecentActivity) {
    return this.api.deleteRecentActivity(activity)
    .map(res => {
      if (res) {
        return new RecentActivity(res);
      }
      return [];
    })
    .catch(error => this.api.handleError(error));
  }
}
