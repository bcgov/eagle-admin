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
import { encodeString, formatDate } from '../shared/utils/utils';

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

  public isMS = !!(window.navigator as any).msSaveOrOpenBlob;
  private _cachedDocument: Document | null = null;

  private readonly documentFields = [
    '_addedBy', 'documentFileName', 'labels', 'internalOriginalName', 'displayName',
    'documentType', 'datePosted', 'dateUploaded', 'dateReceived', 'documentSource',
    'internalURL', 'internalMime', 'internalSize', 'checkbox', 'project', 'type',
    'documentAuthor', 'documentAuthorType', 'projectPhase', 'legislation', 'milestone',
    'description', 'isPublished', 'isFeatured', 'sortOrder', 'secureHitCount', 'publicHitCount',
    'extractionMethod', 'contentExtractedAt'
  ];

  private readonly multiDocumentFields = [
    '_id', 'eaoStatus', 'submittedCAC', 'internalOriginalName', 'documentFileName',
    'labels', 'internalSize', 'displayName', 'documentType', 'datePosted',
    'dateUploaded', 'dateReceived', 'documentSource', 'internalURL', 'internalMime',
    'checkbox', 'project', 'type', 'documentAuthor', 'documentAuthorType',
    'projectPhase', 'milestone', 'description', 'isPublished', 'isFeatured',
    'sortOrder', 'secureHitCount', 'publicHitCount'
  ];

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

  /** Saves the document's file by navigating to its presigned URL; the bytes never pass through HttpClient. */
  async downloadNative(id: string): Promise<void> {
    let url: unknown;
    try {
      // Asked with the bearer, so staff-only rows resolve. DemiApiService.get builds `<kind>/<id>`: this reads `documents/<id>/download`.
      const body = await firstValueFrom(this.demiApi.get<DemiDocumentDownload>(`documents/${encodeURIComponent(id)}`, 'download').pipe(
        withLoading(this.loadingState, `demi-document-download-${id}`, 'Preparing download')
      ));
      url = body?.url;
    } catch {
      this.toast.error('Failed to download document.');
      return;
    }
    if (typeof url !== 'string' || !/^https:\/\//i.test(url)) {
      this.logger.error(`Download URL for document ${id} is missing or not https`, 'DocumentService');
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

  getByMultiId(ids: Array<string>): Observable<Array<Document>> {
    const qs = `document?docIds=${this.api.buildValues(ids)}&fields=${this.api.buildValues(this.multiDocumentFields)}`;
    return this.api.get<Document[]>(qs).pipe(
      withLoading(this.loadingState, `documents-multi-${ids.join(',')}`, 'Loading documents'),
      map((res: any) => res?.length ? res.map((doc: any) => new Document(doc)) : []),
      catchError(error => {
        this.logger.error('Failed to get documents by ids', 'DocumentService', error);
        this.toast.error('Failed to load documents.');
        return of([] as Document[]);
      })
    );
  }

  getById(documentId: string, forceReload = false): Observable<Document> {
    if (!forceReload && this._cachedDocument && this._cachedDocument._id === documentId) {
      return of(this._cachedDocument);
    }
    const qs = `document/${documentId}?fields=${this.api.buildValues(this.documentFields)}`;
    return this.api.get<Document[]>(qs).pipe(
      withLoading(this.loadingState, `document-${documentId}`, 'Loading document'),
      map((res: any) => {
        if (res?.length) {
          this._cachedDocument = new Document(res[0]);
          return this._cachedDocument;
        }
        return null;
      }),
      catchError(error => {
        this.logger.error(`Failed to get document ${documentId}`, 'DocumentService', error);
        this.toast.error('Failed to load document.');
        return of(null as Document);
      })
    );
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

  downloadResource(id: string): Promise<Blob> {
    return this.api.get<Blob>(`document/${id}/download`, { responseType: 'blob' }).toPromise();
  }

  public async downloadDocument(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    let filename = document.documentSource === 'COMMENT' ? document.internalOriginalName : document.documentFileName;
    filename = encodeString(filename, false);
    if (this.isMS) {
      (window.navigator as any).msSaveBlob(blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }

  public async openDocument(document: Document): Promise<void> {
    window.open(documentFetchUrl(document), '_blank');
  }

  public async exportComments(period: string, projectName: string, format: string): Promise<void> {
    const blob = await this.api.get<Blob>(`comment/export/${period}?format=${format}`, { responseType: 'blob' }).toPromise();
    projectName = projectName.split(' ').join('_');
    const currentDate = formatDate(new Date());
    let filename = '';
    if (format === 'staff') {
      filename = `${projectName}-eao-${currentDate}.csv`;
    } else if (format === 'proponent') {
      filename = `${projectName}-proponent-${currentDate}.csv`;
    } else {
      filename = 'export.csv';
    }
    filename = encodeString(filename, true);
    if (this.isMS) {
      (window.navigator as any).msSaveBlob(blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }
}
