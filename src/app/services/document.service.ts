import { Injectable, inject } from '@angular/core';
import { HttpEvent } from '@angular/common/http';
import { Observable, firstValueFrom, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Document } from '../models/document';
import { DemiList } from '../models/demi/demi-list';
import { DemiDocument, DemiDocumentDownload, DemiDocumentListParams } from '../models/demi/document';
import { DemiApiService } from './demi-api.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { encodeString } from '../shared/utils/utils';

/** Admin URL that streams a document inline. */
export function documentFetchUrl(document: Pick<Document, '_id' | 'documentSource' | 'internalOriginalName' | 'documentFileName'>): string {
  const filename = document.documentSource === 'COMMENT' ? document.internalOriginalName : document.documentFileName;
  return `/api/document/${document._id}/fetch/${encodeString(filename, true)}`;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private api = inject(ApiService);
  private demiApi = inject(DemiApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  /** One page of DEMI documents. `filters.project` takes the DEMI project id. */
  listNative(params: DemiDocumentListParams = {}): Observable<DemiList<DemiDocument>> {
    return this.demiApi.list<DemiDocument>('documents', params).pipe(
      withLoading(this.loadingState, `demi-documents-${JSON.stringify(params)}`, 'Loading documents'),
      catchError(() => this.readFailed('Failed to load documents.', { rows: [] }))
    );
  }

  /** A DEMI document by DEMI id or Eagle id; null when it cannot be read. */
  getNative(id: string): Observable<DemiDocument | null> {
    return this.demiApi.get<DemiDocument>('documents', id).pipe(
      withLoading(this.loadingState, `demi-document-${id}`, 'Loading document'),
      catchError(() => this.readFailed('Failed to load document.', null))
    );
  }

  /** DEMI documents for the given ids, in chunks DEMI accepts. Ids DEMI does not return are left out. */
  byIdsNative(ids: string[]): Observable<DemiDocument[]> {
    return this.demiApi.byIds<DemiDocument>('documents', ids).pipe(
      withLoading(this.loadingState, `demi-documents-ids-${ids.join(',')}`, 'Loading documents'),
      catchError(() => this.readFailed('Failed to load documents.', [] as DemiDocument[]))
    );
  }

  /** Presigned https URL for the document's file; null when DEMI hides the document or answers no https URL. */
  downloadUrlNative(id: string): Observable<string | null> {
    // Asked with the bearer, so staff-only rows resolve. DemiApiService.get builds `<kind>/<id>`: this reads `documents/<id>/download`.
    return this.demiApi.get<DemiDocumentDownload>(`documents/${encodeURIComponent(id)}`, 'download').pipe(
      map(body => {
        const url: unknown = body?.url;
        if (typeof url === 'string' && /^https:\/\//i.test(url)) {
          return url;
        }
        this.logger.error(`Download URL for document ${id} is missing or not https`, 'DocumentService');
        return null;
      }),
      catchError(() => of(null))
    );
  }

  /** Saves the document's file by navigating to its presigned URL; the bytes never pass through HttpClient. */
  async downloadNative(id: string): Promise<void> {
    const url = await firstValueFrom(this.downloadUrlNative(id).pipe(
      withLoading(this.loadingState, `demi-document-download-${id}`, 'Preparing download')
    ));
    if (!url) {
      this.toast.error('Failed to download document.');
      return;
    }
    // The presign says `attachment`, so the browser saves the file and this page stays put.
    window.open(url, '_self');
  }

  // DemiApiService errors are already logged by ApiService.handleError.
  private readFailed<T>(toastMessage: string, fallback: T): Observable<T> {
    this.toast.error(toastMessage);
    return of(fallback);
  }

  add(formData: FormData, publish = false): Observable<Document> {
    return this.api.post<Document>(this.addPath(publish), formData).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  /** Same as add(), but emits upload progress events before the saved document. */
  addWithProgress(formData: FormData): Observable<HttpEvent<Document>> {
    return this.api.post<HttpEvent<Document>>(this.addPath(false), formData, { reportProgress: true, observe: 'events' }).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  private addPath(publish: boolean): string {
    const fields = ['documentFileName', 'internalOriginalName', 'displayName', 'internalURL', 'internalMime', 'isFeatured'];
    const qs = `document?fields=${this.api.buildValues(fields)}`;
    return publish ? `${qs}&publish=${publish}` : qs;
  }

  update(formData: FormData, _id: any): Observable<Document> {
    return this.api.put<Document>(`document/${_id}`, formData).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  delete(document: Document): Observable<Document> {
    return this.api.delete<Document>(`document/${document._id}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publish(docId: string): Observable<Document> {
    return this.api.put<Document>(`document/${docId}/publish`, {}).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unPublish(docId: string): Observable<Document> {
    return this.api.put<Document>(`document/${docId}/unpublish`, {}).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  feature(docId: string): Observable<Document> {
    return this.api.put<Document>(`document/${docId}/feature`, {}).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unFeature(docId: string): Observable<Document> {
    return this.api.put<Document>(`document/${docId}/unfeature`, {}).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  public async openDocument(document: Document): Promise<void> {
    window.open(documentFetchUrl(document), '_blank');
  }
}
