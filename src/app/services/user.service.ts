import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { User } from '../models/user';

@Injectable()
export class UserService {
  private api = inject(ApiService);


  save(user: User): Observable<User> {
    return this.api.saveUser(user)
      .pipe(
        catchError(error => this.api.handleError(error))
      );
  }

  add(user: User): Observable<User> {
    return this.api.addUser(user)
      .pipe(
        catchError(error => this.api.handleError(error))
      );
  }
}