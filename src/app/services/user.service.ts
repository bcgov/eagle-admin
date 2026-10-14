import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { DemiApiService } from './demi-api.service';
import { User as LegacyUser } from '../models/user';
import { User, toEagleUserBody } from '../models/demi/user';
import { Group } from '../models/demi/group';
import { DemiList } from '../models/demi/demi-list';

export interface UserListQuery {
  q?: string;
  page: number;
  pageSize: number;
  sort: string;
}

/** For a table fed by route params: a failed page read shows no rows instead of ending the stream. */
export function emptyPageOnError<T>(onError: (err: unknown) => void) {
  return catchError<DemiList<T>, Observable<DemiList<T>>>(err => {
    onError(err);
    return of({ rows: [], total: 0 });
  });
}

/** Contacts and project contact groups: reads from DEMI, writes to eagle-api. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  private demi = inject(DemiApiService);

  listUsers({ q, page, pageSize, sort }: UserListQuery): Observable<DemiList<User>> {
    return this.demi.list<User>('users', { q, page, pageSize, sort, count: true });
  }

  getUser(id: string): Observable<User> {
    return this.demi.get<User>('users', id);
  }

  getUsersByIds(ids: string[]): Observable<User[]> {
    return this.demi.byIds<User>('users', ids);
  }

  getGroup(id: string): Observable<Group> {
    return this.demi.get<Group>('groups', id);
  }

  /** `projectId` is the DEMI project id (`LegacyProject.demiId`), not the Eagle id. */
  listProjectGroups(projectId: string, page: number, pageSize: number, sort: string): Observable<DemiList<Group>> {
    return this.demi.list<Group>('groups', { filters: { project: projectId }, page, pageSize, sort, count: true });
  }

  save(user: LegacyUser | User): Observable<LegacyUser> {
    const body = toEagleUserBody(user);
    return this.api.put<LegacyUser>(`user/${body._id}`, body).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  add(user: LegacyUser | User): Observable<LegacyUser> {
    return this.api.post<LegacyUser>('user/', toEagleUserBody(user)).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}
