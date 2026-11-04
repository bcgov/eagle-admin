import { Injectable, inject } from '@angular/core';
import { Observable, concat, of } from 'rxjs';
import { catchError, last } from 'rxjs/operators';

import { DEMI_MAX_IDS, DemiApiService } from './demi-api.service';
import { User, UserWriteFields, toDemiUserBody } from '../models/demi/user';
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

/**
 * Contacts and project contact groups on DEMI. Write errors pass through with DEMI's
 * `{error, fields}` joined into `message`; callers toast them.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
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

  /** Replaces every field of contact `id`; a field `user` leaves out goes back to empty. */
  save(id: string, user: UserWriteFields): Observable<User> {
    return this.demi.update<User>('users', id, toDemiUserBody(user));
  }

  add(user: UserWriteFields): Observable<User> {
    return this.demi.create<User>('users', toDemiUserBody(user));
  }

  /** `demiProjectId` is `LegacyProject.demiId`; DEMI refuses an Eagle project id. */
  addGroup(demiProjectId: string, name: string): Observable<Group> {
    return this.demi.create<Group>('groups', { projectId: demiProjectId, name });
  }

  renameGroup(groupId: string, name: string): Observable<Group> {
    return this.demi.update<Group>('groups', groupId, { name });
  }

  deleteGroup(groupId: string): Observable<Group> {
    return this.demi.remove<Group>('groups', groupId);
  }

  /**
   * Adds at least one member, in bodies of at most {@link DEMI_MAX_IDS} ids. The bodies go one after
   * another, since each rewrites the same group row; emits the group after the last one.
   */
  addGroupMembers(groupId: string, userIds: string[]): Observable<Group> {
    const chunks: string[][] = [];
    for (let i = 0; i < userIds.length; i += DEMI_MAX_IDS) {
      chunks.push(userIds.slice(i, i + DEMI_MAX_IDS));
    }
    return concat(...chunks.map(chunk => this.demi.addGroupMembers<Group>(groupId, chunk))).pipe(last());
  }

  removeGroupMember(groupId: string, userId: string): Observable<Group> {
    return this.demi.removeGroupMember<Group>(groupId, userId);
  }
}
