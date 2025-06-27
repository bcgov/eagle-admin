import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Document } from '../models/document';

@Injectable()
export class DocumentService {
  // private currentState: any;

  constructor(private api: ApiService) { }

  // get a specific document by its id
  getByMultiId(ids: Array<string>): Observable<Array<Document>> {
    return this.api.getDocumentsByMultiId(ids).pipe(
      map(res => {
        if (res && res.length > 0) {
          // return the first (only) document
          const docs = [];
          res.forEach(doc => {
            docs.push(new Document(doc));
          });
          return docs;
        }
        return null;
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  // get a specific document by its id
  getById(documentId: string): Observable<Document> {
    return this.api.getDocument(documentId).pipe(
      map(res => {
        if (res && res.length > 0) {
          // return the first (only) document
          return new Document(res[0]);
        }
        return null;
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  add(formData: FormData, publish = false): Observable<Document> {
    return this.api.uploadDocument(formData, publish).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  update(formData: FormData, _id: any): Observable<Document> {
    return this.api.updateDocument(formData, _id).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  delete(document: Document): Observable<Document> {
    return this.api.deleteDocument(document).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publish(docId: string): Observable<Document> {
    return this.api.publishDocument(docId).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unPublish(docId: string): Observable<Document> {
    return this.api.unPublishDocument(docId).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  feature(docId: string): Observable<Document> {
    return this.api.featureDocument(docId).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unFeature(docId: string): Observable<Document> {
    return this.api.unFeatureDocument(docId).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}
