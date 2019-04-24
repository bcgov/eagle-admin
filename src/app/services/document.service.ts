import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Document } from 'app/models/document';

@Injectable()
export class DocumentService {
  // private currentState: any;

  constructor(private api: ApiService) { }

  // get a specific document by its id
  getByMultiId(ids: Array<String>): Observable<Array<Document>> {
    return this.api.getDocumentsByMultiId(ids)
      .map(res => {
        if (res && res.length > 0) {
          // return the first (only) document
          let docs = [];
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

  add(formData: FormData): Observable<Document> {
    return this.api.uploadDocument(formData)
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

  publish(document: Document): Observable<Document> {
    return this.api.publishDocument(document)
      .catch(error => this.api.handleError(error));
  }

  unPublish(document: Document): Observable<Document> {
    return this.api.unPublishDocument(document)
      .catch(error => this.api.handleError(error));
  }

}
