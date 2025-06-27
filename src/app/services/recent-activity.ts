import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { RecentActivity } from '../models/recentActivity';

@Injectable()
export class RecentActivityService {

  constructor(private api: ApiService) { }

  // MBL TODO: PUT/POST functionality.
  add(activity: RecentActivity) {
    return this.api.addRecentActivity(activity).pipe(
      map(res => {
        if (res) {
          return new RecentActivity(res);
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  save(activity: RecentActivity) {
    return this.api.saveRecentActivity(activity).pipe(
      map(res => {
        if (res) {
          return new RecentActivity(res);
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  delete(activity: RecentActivity) {
    return this.api.deleteRecentActivity(activity).pipe(
      map(res => {
        if (res) {
          return new RecentActivity(res);
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }
}
