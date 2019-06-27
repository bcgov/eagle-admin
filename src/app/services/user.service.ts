import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { User } from 'app/models/user';

@Injectable()
export class UserService {

  constructor(private api: ApiService) { }

  getAll(): Observable<User[]> {
    return this.api.getUsers()
      .map(res => {
        if (res && res.length > 0) {
          const users: Array<User> = [];
          res.forEach(user => {
            users.push(new User(user));
          });
          return users;
        }
        return [];
      })
      .catch(error => this.api.handleError(error));
  }

  getById(id: any): Observable<User> {
    return this.api.getUser(id)
      // .map(res => {
      //   if (res && res.length > 0) {
      //     const users: Array<User> = [];
      //     res.forEach(user => {
      //       users.push(new User(user));
      //     });
      //     return users;
      //   }
      //   return [];
      // })
      .catch(error => this.api.handleError(error));
  }


  save(user: User): Observable<User> {
    return this.api.saveUser(user)
      .catch(error => this.api.handleError(error));
  }

  add(user: User): Observable<User> {
    return this.api.addUser(user)
      .catch(error => this.api.handleError(error));
  }

}
