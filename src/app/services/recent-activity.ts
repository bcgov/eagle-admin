import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { RecentActivity } from '../models/recentActivity';

@Injectable({ providedIn: 'root' })
export class RecentActivityService {
  private api = inject(ApiService);

  add(activity: RecentActivity): Observable<any> {
    return this.api.post<RecentActivity>('recentActivity/', activity).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => this.api.handleError(error))
    );
  }

  save(activity: RecentActivity): Observable<any> {
    return this.api.put<RecentActivity>(`recentActivity/${activity._id}`, activity).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => this.api.handleError(error))
    );
  }

  delete(activity: RecentActivity): Observable<any> {
    return this.api.delete<RecentActivity>(`recentActivity/${activity._id}`).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => this.api.handleError(error))
    );
  }
}
