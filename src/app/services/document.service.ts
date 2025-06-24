import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Document } from '../models/document';

@Injectable()
export class DocumentService {
  // private currentState: any;

  constructor(private api: ApiService) { }

  // get a specific document by its id
  getByMultiId(ids: Array<string>): Observable<Array<Document>> {
    return this.api.getDocumentsByMultiId(ids)
      .map(res => {
        if (res && res.length > 0) {
          // return the first (only) document
          const docs = [];
          res.forEach(doc => {
            docs.push(new Document(doc));
          });
          return docs;
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  // get a specific document by its id
  getById(documentId: string): Observable<Document> {
    return this.api.getDocument(documentId)
      .map(res => {
        if (res && res.length > 0) {
          // return the first (only) document
          return new Document(res[0]);
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  add(formData: FormData, publish = false): Observable<Document> {
    return this.api.uploadDocument(formData, publish)
      .catch(error => this.api.handleError(error));
  }

  update(formData: FormData, _id: any): Observable<Document> {
    return this.api.updateDocument(formData, _id)
      .catch(error => this.api.handleError(error));
  }

  delete(document: Document): Observable<Document> {
    return this.api.deleteDocument(document)
      .catch(error => this.api.handleError(error));
  }

  publish(docId: string): Observable<Document> {
    return this.api.publishDocument(docId)
      .catch(error => this.api.handleError(error));
  }

  unPublish(docId: string): Observable<Document> {
    return this.api.unPublishDocument(docId)
      .catch(error => this.api.handleError(error));
  }

  feature(docId: string): Observable<Document> {
    return this.api.featureDocument(docId)
      .catch(error => this.api.handleError(error));
  }

  unFeature(docId: string): Observable<Document> {
    return this.api.unFeatureDocument(docId)
      .catch(error => this.api.handleError(error));
  }
}
