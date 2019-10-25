import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { SearchResults, ISearchResults, ISearchResult } from 'app/models/search';
import { Project } from 'app/models/project';
import { Utils } from 'app/shared/utils/utils';

@Injectable()
export class SearchService {

  public isError = false;

  constructor(
    private api: ApiService,
    private utils: Utils
  ) { }

  getItem(_id: string, schema: string): Observable<any> {
    const searchResults = this.api.getItem(_id, schema)
      .map(res => {
        let allResults = <any>[];
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          allResults.push(r);
        });
        if (allResults.length === 1) {
          return allResults[0];
        } else {
          return {};
        }
      })
      .catch(() => {
        this.isError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      });
    return searchResults;
  }

  getFullList(schema: string): Observable<any> {
    return this.api.getFullDataSet(schema);
  }

  // TODO: remove this function once api is working
  getAllLegislationSpecificDataForProject(keys: string, fields: any[], pageNum: number = 1, pageSize: number = 10, sortBy: string = null, queryModifier: object = {}, populate: boolean = false, filter: object = {}): Observable<any[]> {

    // const getDataForYear = (year: string) => {
    //   let data: Project = null;
    //   this.getSearchResults(keys, 'Project', fields, pageNum, pageSize, year, sortBy, queryModifier, populate, filter)
    //     .subscribe((project: ISearchResults<Project>[]) => {
    //       data = this.utils.extractFromSearchResults(project)[0];
    //     });

    // };

    // This is being used for every project detail page to fake the legistlation specific data (hard coded 2002)

    const searchResults = this.api.searchKeywords(keys, 'Project', fields, pageNum, pageSize, '', sortBy, queryModifier, populate, filter)
      .map(res => {
        let allResults = <any>[];
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          r.data.searchResults = r.data.searchResults.map( value => {
            if (value._schemaName === 'Project') {
              const project = {
                '2002': {
                  ...value,
                  ...value.currentProjectData,
                  _id: value._id,
                  _legislationId: value.currentProjectData._id,
                }
              };
              return project;
            } else { return value; }
          });
          allResults.push(r);
        });
        return allResults;
      })
      .catch(() => {
        this.isError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      });
    return searchResults;
  }

  getSearchResults(keys: string, dataset: string, fields: any[], pageNum: number = 1, pageSize: number = 10, projectLegislation: string = '', sortBy: string = null, queryModifier: object = {}, populate: boolean = false, filter: object = {}): Observable<any[]> {
    // this is temporary until the 'all' value works for projectLegislation parameter on api
    if (projectLegislation === 'all') {
      return this.getAllLegislationSpecificDataForProject(keys, fields, pageNum, pageSize, sortBy, queryModifier, populate, filter);
    }
    if (sortBy === '') {
      sortBy = null;
    }
    const searchResults = this.api.searchKeywords(keys, dataset, fields, pageNum, pageSize, projectLegislation, sortBy, queryModifier, populate, filter)
      .map(res => {
        let allResults = <any>[];
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          // on Project schemaName return the project data instead of the whole project which has changed based on ear changes
          r.data.searchResults = r.data.searchResults.map( value => {
            if (value._schemaName === 'Project') {
              return {
                ...value,
                ...value.currentProjectData,
                _id: value._id,
                _legislationId: value.currentProjectData._id
              };
            } else { return value; }
          });
          allResults.push(r);
        });
        return allResults;
      })
      .catch(() => {
        this.isError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      });
    return searchResults;
  }

}
