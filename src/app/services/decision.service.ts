import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Decision } from '../models/decision';

@Injectable()
export class DecisionService {

  constructor(
    private api: ApiService
  ) { }

  add(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = JSON.parse(JSON.stringify(orig));

    // ID must not exist on POST
    delete decision._id;

    // don't send documents
    delete decision.documents;

    // replace newlines with \\n (JSON format)
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }

    return this.api.addDecision(decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  save(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = JSON.parse(JSON.stringify(orig));

    // don't send documents
    delete decision.documents;

    // replace newlines with \\n (JSON format)
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }

    return this.api.saveDecision(decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  delete(decision: Decision): Observable<Decision> {
    return this.api.deleteDecision(decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publish(decision: Decision): Observable<Decision> {
    return this.api.publishDecision(decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unPublish(decision: Decision): Observable<Decision> {
    return this.api.unPublishDecision(decision).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

}
