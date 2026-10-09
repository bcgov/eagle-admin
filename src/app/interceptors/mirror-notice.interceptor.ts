import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

export const MIRROR_PENDING_MESSAGE = 'Saved. It will appear in search within a few minutes.';

const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE']);

// eagle-api sends mirrored: false when the write is saved but the search copy is not updated yet.
export const mirrorNoticeInterceptor: HttpInterceptorFn = (req, next) => {
  if (!WRITE_METHODS.has(req.method)) {
    return next(req);
  }
  const toast = inject(ToastService);

  return next(req).pipe(
    tap(event => {
      if (event.type !== HttpEventType.Response) {
        return;
      }
      const body: unknown = event.body;
      if (typeof body === 'object' && body !== null && (body as { mirrored?: unknown }).mirrored === false) {
        toast.info(MIRROR_PENDING_MESSAGE);
      }
    })
  );
};
