import { Injectable } from '@angular/core';

import { ApiService } from './api';

import { ValuedComponent } from 'app/models/valuedComponent';
import { Observable } from 'rxjs';

@Injectable()
export class ValuedComponentService {

    constructor(
        private api: ApiService,
    ) { }

    getAllByProjectId(projectId: String, pageNum: number = 1, pageSize: number = 10000, sortBy: string = null): Observable<Object> {
        return this.api.getValuedComponentsByProjectId(projectId, pageNum, pageSize, sortBy)
            .map((res: any) => {
                if (res) {
                    let valuedComponents: Array<ValuedComponent> = [];
                    if (!res || res.length === 0) {
                      return { projectId: projectId, totalCount: 0, data: [] };
                    }
                    res[0].results.forEach(valuedComponent => {
                        valuedComponents.push(new ValuedComponent(valuedComponent));
                    });
                    return { projectId: projectId, totalCount: res[0].total_items, data: valuedComponents };
                }
                return {};
            }).catch(error => this.api.handleError(error));
    }

    addToProject(item: any) {
      return this.api.addVCToProject(item)
      .map(() => {
        return {};
      })
      .catch(error => this.api.handleError(error));
    }

    delete(item: any) {
      return this.api.deleteVC(item)
      .map(() => {
        return {};
      }).catch(error => this.api.handleError(error));
    }
}

