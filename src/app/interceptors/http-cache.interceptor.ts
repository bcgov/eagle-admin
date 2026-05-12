import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';
import { LoggingService } from '../services/logging.service';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

class HttpCacheService {
  private cache = new Map<string, CacheEntry>();
  inFlight = new Map<string, Observable<HttpEvent<any>>>();
  private readonly defaultTTL = 15 * 60 * 1000; // 15 minutes

  get(url: string): HttpResponse<any> | null {
    const entry = this.cache.get(url);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTTL) {
      this.cache.delete(url);
      return null;
    }

    return entry.response;
  }

  set(url: string, response: HttpResponse<any>): void {
    this.cache.set(url, {
      response,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Extract resource type from URL path.
   * /api/commentperiod/123/publish → commentperiod
   * /api/project/abc → project
   */
  getResourceType(url: string): string | null {
    const path = url.split('?')[0].replace(/\/+$/, '');
    const segments = path.split('/').filter(Boolean);
    const apiIndex = segments.indexOf('api');
    if (apiIndex >= 0 && apiIndex + 1 < segments.length) {
      return segments[apiIndex + 1];
    }
    return null;
  }

  /**
   * Invalidate all cache entries for a given resource type.
   * Matches /api/resource?... and /api/resource/... regardless of trailing slash or query params.
   */
  clearByResource(resource: string): number {
    let cleared = 0;
    for (const key of Array.from(this.cache.keys())) {
      const keyPath = key.split('?')[0].replace(/\/+$/, '');
      if (keyPath.endsWith(`/api/${resource}`) || keyPath.includes(`/api/${resource}/`)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }
}

const cacheService = new HttpCacheService();

export const httpCacheInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggingService);

  if (req.method !== 'GET') {
    // On mutation, invalidate all cached GETs for the same resource type.
    // Uses resource-type extraction to handle trailing slash / ID / action path variations.
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.ok) {
          const resource = cacheService.getResourceType(req.url);
          if (resource) {
            const cleared = cacheService.clearByResource(resource);
            logger.debug(`Cache invalidated ${cleared} entries for '${resource}' after ${req.method} ${req.url}`, 'HttpCache');
          }
          // Mutations may affect search/aggregation results
          cacheService.clearByResource('search');
        }
      })
    );
  }

  if (req.headers.has('cache-control') && req.headers.get('cache-control') === 'no-cache') {
    return next(req);
  }

  const cachedResponse = cacheService.get(req.urlWithParams);
  if (cachedResponse) {
    logger.debug(`Cache hit for: ${req.url}`, 'HttpCache');
    return of(cachedResponse.clone());
  }

  const existing = cacheService.inFlight.get(req.urlWithParams);
  if (existing) {
    logger.debug(`Coalescing duplicate request: ${req.url}`, 'HttpCache');
    return existing;
  }

  const request$ = next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        logger.debug(`Caching response for: ${req.url}`, 'HttpCache');
        cacheService.set(req.urlWithParams, event);
      }
    }),
    finalize(() => cacheService.inFlight.delete(req.urlWithParams)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  cacheService.inFlight.set(req.urlWithParams, request$);
  return request$;
};

export { cacheService as HttpCacheService };
