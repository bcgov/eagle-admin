import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from './api';
import { ConfigService } from './config.service';
import { DemiList, DemiListParams } from '../models/demi/demi-list';

/** DEMI caps `ids=` at this many values per request. */
export const DEMI_MAX_IDS = 100;

/**
 * Reads from DEMI's native routes (`<DEMI_API_PATH>/<kind>`). Bearer comes from TokenInterceptor.
 * Errors arrive already mapped by `ApiService.handleError`, so callers get the same `Error` as eagle-api reads.
 */
@Injectable({ providedIn: 'root' })
export class DemiApiService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private configService = inject(ConfigService);

  list<T>(kind: string, params: DemiListParams = {}): Observable<DemiList<T>> {
    return this.http.get<T[]>(this.url(kind), { params: toHttpParams(params), observe: 'response' }).pipe(
      map(res => ({ rows: res.body ?? [], total: totalFrom(res.headers.get('x-total-count')) })),
      catchError(err => this.fail(err))
    );
  }

  get<T>(kind: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.url(kind)}/${encodeURIComponent(id)}`).pipe(
      catchError(err => this.fail(err))
    );
  }

  /** Rows for every id, fetched in chunks of {@link DEMI_MAX_IDS}. Ids DEMI does not return are left out. */
  byIds<T>(kind: string, ids: string[]): Observable<T[]> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) {
      return of([]);
    }
    const chunks: string[][] = [];
    for (let i = 0; i < unique.length; i += DEMI_MAX_IDS) {
      chunks.push(unique.slice(i, i + DEMI_MAX_IDS));
    }
    return forkJoin(chunks.map(chunk => this.list<T>(kind, { ids: chunk, pageSize: chunk.length }))).pipe(
      map(pages => pages.flatMap(page => page.rows))
    );
  }

  private url(kind: string): string {
    return `${this.configService.getDemiApiPath()}/${kind}`;
  }

  // DEMI answers `{error}`; handleError reads `error.message`.
  private fail(err: unknown): Observable<never> {
    if (err instanceof HttpErrorResponse && typeof err.error?.error === 'string') {
      err = new HttpErrorResponse({
        error: { message: err.error.error },
        headers: err.headers,
        status: err.status,
        statusText: err.statusText,
        url: err.url ?? undefined
      });
    }
    return this.api.handleError(err as HttpErrorResponse | Error);
  }
}

function toHttpParams(params: DemiListParams): HttpParams {
  let p = new HttpParams();
  if (params.page != null) { p = p.set('page', params.page); }
  if (params.pageSize != null) { p = p.set('pageSize', params.pageSize); }
  if (params.count) { p = p.set('count', 'true'); }
  if (params.sort) { p = p.set('sort', params.sort); }
  if (params.q) { p = p.set('q', params.q); }
  if (params.ids?.length) { p = p.set('ids', params.ids.join(',')); }
  for (const [field, value] of Object.entries(params.filters ?? {})) {
    if (value == null) { continue; }
    p = Array.isArray(value)
      ? value.reduce((acc: HttpParams, v) => acc.append(field, v), p)
      : p.set(field, value);
  }
  return p;
}

function totalFrom(header: string | null): number | undefined {
  const n = header ? Number(header) : NaN;
  return Number.isFinite(n) ? n : undefined;
}
