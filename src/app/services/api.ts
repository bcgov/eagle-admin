import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { ConfigService } from './config.service';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private logger = inject(LoggingService);

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
}
