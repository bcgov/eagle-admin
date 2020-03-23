import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { Decision } from 'app/models/decision';

@Injectable()
export class DecisionService {

  constructor(
    private api: ApiService
  ) { }

  add(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = _.cloneDeep(orig);

    // ID must not exist on POST
    delete decision._id;

    // don't send documents
    delete decision.documents;

    // replace newlines with \\n (JSON format)
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }

    return this.api.addDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  save(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = _.cloneDeep(orig);

    // don't send documents
    delete decision.documents;

    // replace newlines with \\n (JSON format)
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }

    return this.api.saveDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  delete(decision: Decision): Observable<Decision> {
    return this.api.deleteDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  publish(decision: Decision): Observable<Decision> {
    return this.api.publishDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  unPublish(decision: Decision): Observable<Decision> {
    return this.api.unPublishDecision(decision)
      .catch(error => this.api.handleError(error));
  }

}
