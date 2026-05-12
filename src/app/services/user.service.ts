import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  save(user: User): Observable<User> {
    return this.api.put<User>(`user/${user._id}`, user).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  add(user: User): Observable<User> {
    return this.api.post<User>('user/', user).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}