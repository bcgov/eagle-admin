import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { flatMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';

import { Project } from 'app/models/project';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Org } from 'app/models/org';
import { SearchService } from './search.service';
import { ISearchResults } from 'app/models/search';
import { Utils } from 'app/shared/utils/utils';

interface GetParameters {
  getresponsibleEPD?: boolean;
  getprojectLead?: boolean;
}

@Injectable()
export class ProjectService {
  private projectList: Project[] = [];
  constructor(
    private api: ApiService,
    private searchService: SearchService,
    private utils: Utils
  ) { }

  // get count of projects
  getCount(): Observable<number> {
    return this.api.getCountProjects()
      .catch(error => this.api.handleError(error));
  }

  // get all projects
  getAll(pageNum: number = 1, pageSize: number = 20, sortBy: string = null): Observable<Object> {
    return this.searchService.getSearchResults('', 'Project', null, pageNum, pageSize, '', sortBy, {}, true,  {})
      .map((res: ISearchResults<Project>[]) => {
        if (res) {
          const results = this.utils.extractFromSearchResults(res);
          // let projects: Array<Project> = [];
          this.projectList = [];
          results.forEach(project => {
            this.projectList.push(new Project(project));
          });
          return { totalCount: res[0].data.meta[0].searchResultsTotal, data: this.projectList };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  getById(projId: string, cpStart: string = null, cpEnd: string = null): Observable<Project> {
    return this.searchService.getSearchResults('', 'Project', null, null, 1, '', '', {_id: projId}, true, {})
      .map((projects: ISearchResults<Project>[]) => {
        let results;
        // get upcoming comment period if there is one and convert it into a comment period object.
        if (projects.length > 0) {
          results = this.utils.extractFromSearchResults(projects);
          if (results[0].commentPeriodForBanner && results[0].commentPeriodForBanner.length > 0) {
            results[0].commentPeriodForBanner = new CommentPeriod(results[0].commentPeriodForBanner[0]);
          } else {
            results[0].commentPeriodForBanner = null;
          }
        }
        // return the first (only) project
        return results.length > 0 ? new Project(results[0]) : null;
      })
      .pipe(
        flatMap(res => {
          let project = res;
          if (!project) {
            return of(null as Project);
          }
          if (project.projectLeadId == null && project.responsibleEPDId == null) {
            return of(new Project(project));
          }
          // now get the rest of the data for this project
          return this._getExtraAppData(
            new Project(project),
            {
              getresponsibleEPD: project.responsibleEPDId !== null && project.responsibleEPDId !== '' || project.responsibleEPDId !== undefined,
              getprojectLead: project.projectLeadId !== null && project.projectLeadId !== '' || project.projectLeadId !== undefined
            }
          );
        })
      )
      .catch(error => this.api.handleError(error));
  }

  private _getExtraAppData(project: Project, { getresponsibleEPD = false, getprojectLead = false }: GetParameters): Observable<Project> {
    return forkJoin(
      getresponsibleEPD ? this.searchService.getItem(project.responsibleEPDId.toString(), 'User') : of(null),
      getprojectLead ? this.searchService.getItem(project.projectLeadId.toString(), 'User') : of(null)
    )
      .map(payloads => {
        if (getresponsibleEPD) {
          project.responsibleEPDObj = payloads[0].data;
        }
        if (getprojectLead) {
          project.projectLeadObj = payloads[1].data;
        }
        // finally update the object and return
        return project;
      });
  }

  // create new project
  add(item: Project): Observable<Project> {
    delete item._id;

    // replace newlines with \\n (JSON format)
    if (item.description) {
      item.description = item.description.replace(/\n/g, '\\n');
    }

    return this.api.addProject(item)
      .catch(error => this.api.handleError(error));
  }

  // update existing project
  save(orig: Project): Observable<Project> {
    // make a (deep) copy of the passed-in project so we don't change it
    const proj = _.cloneDeep(orig);

    // replace newlines with \\n (JSON format)
    if (proj.description) {
      proj.description = proj.description.replace(/\n/g, '\\n');
    }

    return this.api.saveProject(proj)
      .catch(error => this.api.handleError(error));
  }

  delete(proj: Project): Observable<Project> {
    return this.api.deleteProject(proj)
      .catch(error => this.api.handleError(error));
  }

  publish(proj: Project): Observable<Project> {
    console.log('publishgin');
    return this.api.publishProject(proj)
      .catch(error => this.api.handleError(error));
  }

  unPublish(proj: Project): Observable<Project> {
    return this.api.unPublishProject(proj)
      .catch(error => this.api.handleError(error));
  }

  addPins(proj: Project, pins: any): Observable<Project> {
    return this.api.addPinsToProject(proj, pins)
      .catch(error => this.api.handleError(error));
  }

  addGroup(proj: Project, group: any): Observable<Project> {
    return this.api.addGroupToProject(proj, group)
      .catch(error => this.api.handleError(error));
  }

  saveGroup(projectId: any, groupId: any, groupObj: any): Observable<Project> {
    return this.api.saveGroup(projectId, groupId, groupObj)
      .catch(error => this.api.handleError(error));
  }

  deleteGroup(proj: Project, group: string): Observable<Project> {
    return this.api.deleteGroup(proj, group)
      .catch(error => this.api.handleError(error));
  }

  deletePin(projId: string, pin: string): Observable<Project> {
    return this.api.deletePin(projId, pin)
      .catch(error => this.api.handleError(error));
  }

  getPins(proj: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    return this.api.getProjectPins(proj, pageNum, pageSize, sortBy)
      .catch(error => this.api.handleError(error));
  }

  getGroupMembers(proj: string, groupId: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    return this.api.getProjectGroupMembers(proj, groupId, pageNum, pageSize, sortBy)
      .catch(error => this.api.handleError(error));
  }

  addGroupMembers(proj: Project, groupId: string, members: any): Observable<Project> {
    return this.api.addMembersToGroup(proj, groupId, members)
      .catch(error => this.api.handleError(error));
  }

  deleteGroupMembers(projectId: string, groupId: string, member: string): Observable<Project> {
    return this.api.deleteMembersFromGroup(projectId, groupId, member)
      .catch(error => this.api.handleError(error));
  }

  // isAccepted(status: string): boolean {
  //   return (status && status.toUpperCase() === 'ACCEPTED');
  // }

  // // NOTE: a decision may or may not include Cancelled
  // // see code that uses this helper
  // isDecision(status: string): boolean {
  //   const s = (status && status.toUpperCase());
  //   return (s === 'ALLOWED'
  //     || s === 'CANCELLED'
  //     || s === 'DISALLOWED'
  //     || s === 'OFFER ACCEPTED'
  //     || s === 'OFFER NOT ACCEPTED'
  //     || s === 'OFFERED');
  // }
}
