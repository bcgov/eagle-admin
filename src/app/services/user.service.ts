import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { User } from '../models/user';

@Injectable()
export class UserService {

  constructor(private api: ApiService) { }

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