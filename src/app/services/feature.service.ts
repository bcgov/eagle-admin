import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Feature } from 'app/models/feature';

@Injectable()
export class FeatureService {

  constructor(private api: ApiService) { }

  getByTantalisId(tantalisId: number): Observable<Feature[]> {
    return this.api.getFeaturesByTantalisId(tantalisId)
      .map(res => {
        if (res && res.length > 0) {
          const features: Array<Feature> = [];
          res.forEach(f => {
            features.push(new Feature(f));
          });
          return features;
        }
        return [];
      })
      .catch(error => this.api.handleError(error));
  }

  getByProjectId(projectId: string): Observable<Feature[]> {
    return this.api.getFeaturesByProjectId(projectId)
      .map(res => {
        if (res && res.length > 0) {
          const features: Array<Feature> = [];
          res.forEach(f => {
            features.push(new Feature(f));
          });
          return features;
        }
        return [];
      })
      .catch(error => this.api.handleError(error));
  }

  // deleteByApplicationId(applicationId: string): Observable<Object> {
  //   return this.api.deleteFeaturesByApplicationId(applicationId)
  //     .catch(error => this.api.handleError(error));
  // }

  // MBL TODO: PUT/POST functionality.

  // TODO: publish/unpublish functionality

}
