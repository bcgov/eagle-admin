import { Injectable, inject } from '@angular/core';
import { Observable, defer, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { ApiService } from './api';
import { DemiApiService } from './demi-api.service';
import { RecentActivity } from '../models/recentActivity';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { toEagleWriteBody } from '../models/demi/comment-period';
import { DemiUpdate, updateParentId } from '../models/demi/update';
import { isConflict } from '../activity/update-rules';

/**
 * eagle-api write body for an update. A body with `_id` is legacy and goes out unchanged; a native row gets its
 * Eagle id and `project` = the parent's Eagle id, minus DEMI-only fields. A row with no Eagle id throws.
 */
export function toEagleUpdateBody(activity: RecentActivity | DemiUpdate, isNew = false): any {
  if ('_id' in activity) {
    return activity;
  }
  const project = updateParentId(activity);
  const body = toEagleWriteBody(activity, 'update', project ? { project } : {}, isNew);
  delete body.isPublished;
  return body;
}

@Injectable({ providedIn: 'root' })
export class RecentActivityService {
  private api = inject(ApiService);
  private demi = inject(DemiApiService);

  /** One page of updates, with `total`. `filters.project` takes the parent's EAGLE id. */
  list(params: DemiListParams = {}): Observable<DemiList<DemiUpdate>> {
    return this.demi.list<DemiUpdate>('updates', { count: true, ...params });
  }

  getNative(id: string): Observable<DemiUpdate> {
    return this.demi.get<DemiUpdate>('updates', id);
  }

  add(activity: RecentActivity | DemiUpdate): Observable<any> {
    return defer(() => this.api.post<RecentActivity>('recentActivity/', toEagleUpdateBody(activity, true))).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => this.api.handleError(error))
    );
  }

  // A 409 (stale dateUpdated) passes through as-is so callers can tell it apart.
  save(activity: RecentActivity | DemiUpdate): Observable<any> {
    return defer(() => {
      const body = toEagleUpdateBody(activity);
      return this.api.put<RecentActivity>(`recentActivity/${body._id}`, body);
    }).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => isConflict(error) ? throwError(() => error) : this.api.handleError(error))
    );
  }

  // Keeps the row's dateUpdated current so the next PUT is not a 409; flips back on error.
  togglePin(activity: RecentActivity | DemiUpdate): Observable<any> {
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
  archive(activity: RecentActivity | DemiUpdate): Observable<any> {
    return defer(() => this.api.delete<RecentActivity>(`recentActivity/${toEagleUpdateBody(activity)._id}`)).pipe(
      map(res => res ? new RecentActivity(res) : []),
      catchError(error => this.api.handleError(error))
    );
  }
}
