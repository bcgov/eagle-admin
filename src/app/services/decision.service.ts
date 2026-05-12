import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Decision } from '../models/decision';

@Injectable({ providedIn: 'root' })
export class DecisionService {
  private api = inject(ApiService);

  private readonly fields = ['_addedBy', '_project', 'code', 'name', 'description'];

  getByProjId(projId: string): Observable<Decision[]> {
    const qs = `decision?_project=${projId}&fields=${this.api.buildValues(this.fields)}`;
    return this.api.get<Decision[]>(qs).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  getById(id: string): Observable<Decision[]> {
    const qs = `decision/${id}?fields=${this.api.buildValues(this.fields)}`;
    return this.api.get<Decision[]>(qs).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  add(orig: Decision): Observable<Decision> {
    const decision = JSON.parse(JSON.stringify(orig));
    delete decision._id;
    delete decision.documents;
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }
    return this.api.post<Decision>('decision/', decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  save(orig: Decision): Observable<Decision> {
    const decision = JSON.parse(JSON.stringify(orig));
    delete decision.documents;
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }
    return this.api.put<Decision>(`decision/${decision._id}`, decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  delete(decision: Decision): Observable<Decision> {
    return this.api.delete<Decision>(`decision/${decision._id}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publish(decision: Decision): Observable<Decision> {
    return this.api.put<Decision>(`decision/${decision._id}/publish`, decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unPublish(decision: Decision): Observable<Decision> {
    return this.api.put<Decision>(`decision/${decision._id}/unpublish`, decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

}
