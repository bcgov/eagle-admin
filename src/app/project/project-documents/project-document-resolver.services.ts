import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/switchMap';
import * as _ from 'lodash';
import { ConfigService } from 'src/app/services/config.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';


@Injectable()
export class DocumentsResolver implements Resolve<Observable<object>> {
  private filterForAPI: object = {};

  constructor(
    private configService: ConfigService,
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const projectId = route.parent.paramMap.get('projId');
    const list = this.configService.lists;
    const params = this.storageService.state.projectDocumentTableParams || route.params;
    const pageNum = params.pageNum ? params.pageNum : 1;
    const pageSize = params.pageSize ? params.pageSize : 10;
    const sortBy = params.sortBy ? params.sortBy : '-datePosted,+displayName';
    const keywords = params.keywords || '';

    const milestones: any[] = [];
    const authors: any[] = [];
    const types: any[] = [];
    const projectPhases: any[] = [];

    // Get the list types that are needed.
    if (list && list.length > 0) {
      list.forEach(item => {
        switch (item.type) {
          case 'label':
            milestones.push({ ...item });
            break;
          case 'author':
            authors.push({ ...item });
            break;
          case 'doctype':
            types.push({ ...item });
            break;
          case 'projectPhase':
            projectPhases.push({ ...item });
            break;
          default:
            break;
        }
      });
    }

    // Validate the filter parameters being sent to the API using the list values.
    this.setFilterFromParams(route.params, milestones, authors, types, projectPhases);

    const categorizedObs = this.searchService.getSearchResults(
      keywords,
      'Document',
      [
        { name: 'project', value: projectId },
        { name: 'categorized', value: true }
      ],
      pageNum,
      pageSize,
      sortBy,
      { documentSource: 'PROJECT' },
      true,
      this.filterForAPI,
      ''
    );

    return categorizedObs.map(res => (
      {
        categorized: res[0],
      }
    ));

  }

  paramsToCollectionFilter(params, name, collection, identifyBy) {
    delete this.filterForAPI[name];

    if (params[name] && collection) {
      let confirmedValues = [];
      // look up each value in collection
      const values = params[name].split(',');
      values.forEach(value => {
        const record = _.find(collection, [ identifyBy, value ]);
        if (record) {
          confirmedValues.push(value);
        }
      });
      if (confirmedValues.length) {
        this.filterForAPI[name] = confirmedValues.join(',');
      }
    }
  }

  paramsToDateFilter(params, name) {
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForAPI[name] = params[name];
    }
  }

  setFilterFromParams(params, milestones: any[], authors: any[], types: any[], projectPhases: any[]) {
    this.paramsToCollectionFilter(params, 'milestone', milestones, '_id');
    this.paramsToCollectionFilter(params, 'documentAuthorType', authors, '_id');
    this.paramsToCollectionFilter(params, 'type', types, '_id');
    this.paramsToCollectionFilter(params, 'projectPhase', projectPhases, '_id');

    this.paramsToDateFilter(params, 'datePostedStart');
    this.paramsToDateFilter(params, 'datePostedEnd');
  }
}
