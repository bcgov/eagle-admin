import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DemiApiService } from './demi-api.service';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { DemiUpdate } from '../models/demi/update';
import { pickFields } from '../shared/utils/utils';

/** A DEMI update row as its writers read it: `_etag` is the version a PUT names. */
export type LoadedUpdate = DemiUpdate & { _etag?: string; complianceAndEnforcement?: boolean };

/** What a form or table hands to a write. `projectId` is the parent's Eagle id. */
export type UpdateWrite = Partial<Omit<LoadedUpdate, 'publishDate'>> & { publishDate?: string | Date | null };

// DEMI's POST /updates takes only these; any other key is a 400 except `_id`, `dateAdded`, `dateUpdated`,
// `read`, `notifiedAt` and `pinned`, which it drops.
const CREATE_FIELDS = [
  'projectId', 'headline', 'content', 'type', 'active', 'complianceAndEnforcement', 'notificationName', 'contentUrl',
  'documentUrl', 'pcp', 'projectNotification', 'category', 'subject', 'shortHeadline', 'summary', 'attachments',
  'location', 'engagementUrl', 'status', 'publishDate', 'featuredImage', 'images', 'regions'
] as const;
// PUT also takes these. A row changed since its `_etag` was read is a 409.
const UPDATE_FIELDS = [...CREATE_FIELDS, 'pinned', '_etag'] as const;

function writeBody(update: UpdateWrite, fields: readonly string[]): Record<string, unknown> {
  return pickFields(update, fields, value => value !== undefined);
}

/** DEMI `/updates` reads and writes. Writes go to the row's DEMI `id`; errors pass through for the caller to toast. */
@Injectable({ providedIn: 'root' })
export class RecentActivityService {
  private demi = inject(DemiApiService);

  /** One page of updates, with `total`. `filters.project` takes the parent's EAGLE id. */
  list(params: DemiListParams = {}): Observable<DemiList<DemiUpdate>> {
    return this.demi.list<DemiUpdate>('updates', { count: true, ...params });
  }

  /** Read fresh: the edit form sends this `_etag` back with its PUT. */
  getNative(id: string): Observable<LoadedUpdate> {
    return this.demi.get<LoadedUpdate>('updates', id, { fresh: true });
  }

  add(update: UpdateWrite): Observable<LoadedUpdate> {
    return this.demi.create<LoadedUpdate>('updates', writeBody(update, CREATE_FIELDS));
  }

  save(update: UpdateWrite): Observable<LoadedUpdate> {
    return this.demi.update<LoadedUpdate>('updates', update.id, writeBody(update, UPDATE_FIELDS));
  }

  /** Flips `row.pinned` at once and back on error. Sends no `_etag`, so a pin is never refused as stale. */
  togglePin(row: UpdateWrite): Observable<LoadedUpdate> {
    const before = row.pinned;
    row.pinned = !before;
    return this.demi.update<LoadedUpdate>('updates', row.id, { pinned: row.pinned }).pipe(
      catchError(error => {
        row.pinned = before;
        return throwError(() => error);
      })
    );
  }

  /** DEMI's DELETE sets status `archived`; nothing is removed. */
  archive(row: UpdateWrite): Observable<LoadedUpdate> {
    return this.demi.remove<LoadedUpdate>('updates', row.id);
  }
}
