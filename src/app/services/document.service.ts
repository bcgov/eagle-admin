import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import JSZip from 'jszip';

import { ApiService } from './api';
import { Document } from '../models/document';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { encodeString, formatDate, getFormattedTime } from '../shared/utils/utils';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private api = inject(ApiService);
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

  getByMultiId(ids: Array<string>): Observable<Array<Document>> {
    const qs = `document?docIds=${this.api.buildValues(ids)}&fields=${this.api.buildValues(this.multiDocumentFields)}`;
    return this.api.get<Document[]>(qs).pipe(
      withLoading(this.loadingState, `documents-multi`, 'Loading documents'),
      map((res: any) => res?.length ? res.map((doc: any) => new Document(doc)) : []),
      catchError(error => {
        this.logger.error('Failed to get documents by ids', 'DocumentService', error);
        this.toast.error('Failed to load documents.');
        return of([] as Document[]);
      })
    );
  }

  getByAppId(projId: string): Observable<Document[]> {
    const fields = [
      '_project', 'documentFileName', 'displayName', 'internalURL', 'internalMime',
      'isFeatured', 'sortOrder', 'secureHitCount', 'publicHitCount'
    ];
    const qs = `document?isDeleted=false&_project=${projId}&fields=${this.api.buildValues(fields)}`;
    return this.api.get<Document[]>(qs).pipe(
      withLoading(this.loadingState, `documents-app-${projId}`, 'Loading documents'),
      map((res: any) => res?.length ? res.map((doc: any) => new Document(doc)) : []),
      catchError(error => {
        this.logger.error(`Failed to get documents for project ${projId}`, 'DocumentService', error);
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
    const fields = ['documentFileName', 'internalOriginalName', 'displayName', 'internalURL', 'internalMime', 'isFeatured'];
    let qs = `document?fields=${this.api.buildValues(fields)}`;
    if (publish) { qs += `&publish=${publish}`; }
    return this.api.post<Document>(qs, formData).pipe(
      catchError(error => this.api.handleError(error))
    );
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

  private downloadResource(id: string): Promise<Blob> {
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
    let filename = document.documentSource === 'COMMENT' ? document.internalOriginalName : document.documentFileName;
    filename = encodeString(filename, true);
    window.open('/api/document/' + document._id + '/fetch/' + filename, '_blank');
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

  public downloadElementThumbnail(inspectionId: string, elementId: string, itemId: string): Promise<Blob> {
    return this.api.get<Blob>(`inspection/${inspectionId}/${elementId}/${itemId}?thumbnail=true`, { responseType: 'blob' }).toPromise();
  }

  public async openElementResource(element: any): Promise<void> {
    const filename = element.internalURL.substring(element.internalURL.lastIndexOf('/') + 1);
    window.open(`/api/inspection/element/${element._id}/${filename}`, '_blank');
  }

  public async downloadInspectionItem(inspection: any, elementId: string, item: any): Promise<void> {
    const tempDate = new Date(item.timestamp);
    let filename = `${inspection.name}_${getFormattedTime(tempDate)}`;
    filename = filename.replace('.', '-');
    const qs = `inspection/${inspection._id}/${elementId}/${item._id}?filename=${filename}`;
    let blob: Blob = null;
    try {
      blob = await this.api.get<Blob>(qs, { responseType: 'blob' }).toPromise();
    } catch {
      alert('An error has occured.');
      throw Error('Unable to download item');
    }
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

  public async downloadInspection(inspection: any): Promise<void> {
    const zip = new JSZip();
    zip.file(
      `inspection.txt`,
      `
      Name: ${inspection.name}\n
      Inspection Number: ${inspection.case}\n
      Inspector email: ${inspection.email}\n
      Start Date: ${inspection.startDate}\n
      End Date: ${inspection.endDate}\n
      Project: ${inspection.project.name}\n
      `
    );

    for (let i = 0; i < inspection.elements.length; i++) {
      const element = inspection.elements[i];
      const elementFolder = zip.folder(element.title);
      elementFolder.file(
        `element-${element.title}.txt`,
        `
        Title: ${element.title}\n
        Description: ${element.description}\n
        Requirement: ${element.requirement}\n
        Timestamp: ${element.timestamp}\n
        `
      );

      for (let j = 0; j < element.items.length; j++) {
        const itemQs = `search?dataset=Item&_id=${element.items[j]}&_schemaName=${'InspectionItem'}`;
        let itemSearchResults: any[] = null;
        try {
          itemSearchResults = await this.api.get<any[]>(itemQs).toPromise();
        } catch {
          alert('An error has occured.');
          throw Error('Unable to find inspection item.');
        }

        const item = itemSearchResults[0];
        const tempDate = new Date(item.timestamp);
        const filename = `${inspection.name}_${getFormattedTime(tempDate)}.${item.internalExt}`;
        const itemDownloadQs = `inspection/${inspection._id}/${element._id}/${item._id}?filename=${filename}`;
        let blob: Blob = null;
        try {
          blob = await this.api.get<Blob>(itemDownloadQs, { responseType: 'blob' }).toPromise();
        } catch {
          alert('An error has occured.');
          throw Error('Unable to get asset.');
        }

        elementFolder.file(`${filename}_caption.txt`, `\n          ${item.caption}\n          `);
        elementFolder.file(filename, blob, { base64: true });
      }
    }

    let content: Blob = null;
    try {
      content = await zip.generateAsync({ type: 'blob' });
    } catch {
      alert('An error has occured.');
      throw Error('Unable to generate zip file.');
    }

    if (this.isMS) {
      (window.navigator as any).msSaveBlob(content, 'inspection.zip');
    } else {
      const url = window.URL.createObjectURL(content);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = 'inspection.zip';
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }
}
