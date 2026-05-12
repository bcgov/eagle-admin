import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from './config.service';
import { LoggingService } from './logging.service';
import { KeycloakService } from './keycloak.service';

interface LocalLoginResponse {
  _id: string;
  title: string;
  created_at: string;
  startTime: string;
  endTime: string;
  state: boolean;
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private keycloakService = inject(KeycloakService);
  private configService = inject(ConfigService);
  private logger = inject(LoggingService);
  private token: string;

  // Config getters
  get env(): string {
    return this.configService.config().ENVIRONMENT || 'local';
  }

  get bannerColour(): string {
    return this.configService.config().BANNER_COLOUR || 'red';
  }

  get pathAPI(): string {
    return this.configService.getApiPath();
  }

  /** Build a pipe-delimited field list for API query strings. */
  buildValues(collection: any[]): string {
    return collection.join('|');
  }

  handleError(error: HttpErrorResponse | Error): Observable<never> {
    let message: string;
    if (error instanceof HttpErrorResponse) {
      if (error.error?.message) {
        message = error.error.message;
      } else if (typeof error.error === 'string' && error.error.length) {
        message = error.error;
      } else {
        message = `${error.status} - ${error.statusText || 'Server error'}`;
      }
      if (error.status === 403 && !this.keycloakService.keycloakEnabled) {
        window.location.href = '/admin/login';
      }
    } else {
      message = (error as Error).message || 'Unknown error';
    }
    this.logger.error(message, 'ApiService', error);
    return throwError(() => new Error(message));
  }

  // Generic HTTP methods — bearer token added by TokenInterceptor
  get<T>(path: string, options?: any): Observable<T> {
    return this.http.get<T>(`${this.pathAPI}/${path}`, options || {}) as Observable<T>;
  }

  post<T>(path: string, body: any = null, options?: any): Observable<T> {
    return this.http.post<T>(`${this.pathAPI}/${path}`, body, options || {}) as Observable<T>;
  }

  put<T>(path: string, body: any = null, options?: any): Observable<T> {
    return this.http.put<T>(`${this.pathAPI}/${path}`, body, options || {}) as Observable<T>;
  }

  delete<T>(path: string, options?: any): Observable<T> {
    return this.http.delete<T>(`${this.pathAPI}/${path}`, options || {}) as Observable<T>;
  }

  head(path: string, options?: any): Observable<any> {
    return this.http.head(`${this.pathAPI}/${path}`, options || {});
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LocalLoginResponse>(`${this.pathAPI}/login/token`, { username, password })
      .pipe(
        map(res => {
          if (res && res.accessToken) {
            this.token = res.accessToken;
            window.localStorage.clear();
            window.localStorage.setItem('currentUser', JSON.stringify({ username, token: this.token }));
            return true;
          }
          return false;
        })
      );
  }

  logout() {
    this.token = null;
    window.localStorage.removeItem('currentUser');
  }

}
