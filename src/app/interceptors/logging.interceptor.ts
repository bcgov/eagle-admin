import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggingService);

  logger.logHttpRequest(req.method, req.url);

  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        logger.logHttpResponse(req.method, req.url, event.status);
      }
    }),
    catchError(error => {
      logger.logHttpError(req.method, req.url, error);
      return throwError(() => error);
    })
  );
};
