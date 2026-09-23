import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { ApiService } from './api';
import { RecentActivity } from '../models/recentActivity';
import { isConflict } from '../activity/update-rules';

@Injectable({ providedIn: 'root' })
export class RecentActivityService {
  private api = inject(ApiService);

  add(activity: RecentActivity): Observable<any> {
    return this.api.post<RecentActivity>('recentActivity/', activity).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => this.api.handleError(error))
    );
  }

  // A 409 (stale dateUpdated) passes through as-is so callers can tell it apart.
  save(activity: RecentActivity): Observable<any> {
    return this.api.put<RecentActivity>(`recentActivity/${activity._id}`, activity).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => isConflict(error) ? throwError(() => error) : this.api.handleError(error))
    );
  }

  // Keeps the row's dateUpdated current so the next PUT is not a 409; flips back on error.
  togglePin(activity: RecentActivity): Observable<any> {
    activity.pinned = !activity.pinned;
    return this.save(activity).pipe(
      tap(saved => { activity.dateUpdated = saved.dateUpdated; }),
      catchError(error => {
        activity.pinned = !activity.pinned;
        return throwError(() => error);
      })
    );
  }

  // The API's DELETE route archives the Update (status 'archived'); nothing is removed.
  archive(activity: RecentActivity): Observable<any> {
    return this.api.delete<RecentActivity>(`recentActivity/${activity._id}`).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => this.api.handleError(error))
    );
  }
}
