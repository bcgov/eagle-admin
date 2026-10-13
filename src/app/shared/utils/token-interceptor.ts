import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, share, switchMap } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';

/**
 * Adds the bearer token to same-origin requests under the eagle-api or DEMI path, and nowhere else
 * (presigned object-store URLs and other hosts must never see it).
 * On a 401 or 403 from those paths it refreshes the token once and retries the request.
 */
@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  private auth = inject(KeycloakService);
  private configService = inject(ConfigService);

  private refresh$: Observable<unknown> | null = null;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isOwnApi(request.url)) {
      return next.handle(request);
    }

    return next.handle(this.addAuthHeader(request)).pipe(
      catchError(error => {
        if (error.status !== 401 && error.status !== 403) {
          return throwError(() => error);
        }
        return this.refreshToken().pipe(
          catchError(() => throwError(() => error)),
          switchMap(() => next.handle(this.addAuthHeader(request)))
        );
      })
    );
  }

  private isOwnApi(url: string): boolean {
    const origin = window.location.origin;
    const target = new URL(url, origin);
    if (target.origin !== origin) {
      return false;
    }
    return [this.configService.getApiPath(), this.configService.getDemiApiPath()].some(base => {
      const prefix = new URL(base, origin);
      const path = prefix.pathname.replace(/\/+$/, '');
      return prefix.origin === origin && (target.pathname === path || target.pathname.startsWith(`${path}/`));
    });
  }

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const authToken: string = this.auth.getToken() || '';
    return request.clone({ setHeaders: { Authorization: 'Bearer ' + authToken } });
  }

  // One refresh shared by every request that failed while it runs; cleared on success or failure.
  private refreshToken(): Observable<unknown> {
    if (!this.refresh$) {
      this.refresh$ = this.auth.refreshToken().pipe(
        finalize(() => { this.refresh$ = null; }),
        share()
      );
    }
    return this.refresh$;
  }
}
