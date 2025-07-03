import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, merge } from 'rxjs';
import { flatMap, map, catchError } from 'rxjs/operators';

import { ApiService } from './api';

import { SearchService } from './search.service';
import { CommentPeriod } from '../models/commentPeriod';
import { FullProject } from '../models/fullProject';
import { Org } from '../models/org';
import { Project } from '../models/project';
import { Utils } from '../shared/utils/utils';


interface GetParameters {
  getresponsibleEPD?: boolean;
  getprojectLead?: boolean;
}

@Injectable()
export class ProjectService {
  private api = inject(ApiService);
  private utils = inject(Utils);
  private searchService = inject(SearchService);

  private projectList: Project[] = [];

  // get count of projects
  getCount(): Observable<number> {
    return this.api.getCountProjects().pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  // get all projects
  getAll(pageNum = 1, pageSize = 20, sortBy: string = null): Observable<object> {
    return this.api.getProjects(pageNum, pageSize, sortBy).pipe(
      map((res: any) => {
        if (res) {
          this.projectList = [];
          res[0].results.forEach(project => {
            this.projectList.push(new Project(project));
          });
          return { totalCount: res[0].total_items, data: this.projectList };
        }
        return {};
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  getById(projId: string, cpStart: string = null, cpEnd: string = null): Observable<Project> {
    return this.api.getProject(projId, cpStart, cpEnd).pipe(
      map(projects => {
        // get upcoming comment period if there is one and convert it into a comment period object.
        if (projects.length > 0) {
          if (projects[0].commentPeriodForBanner && projects[0].commentPeriodForBanner.length > 0) {
            projects[0].commentPeriodForBanner = new CommentPeriod(projects[0].commentPeriodForBanner[0]);
          } else {
            projects[0].commentPeriodForBanner = null;
          }
        }
        // return the first (only) project
        return projects.length > 0 ? new Project(projects[0]) : null;
      }),
      flatMap(res => {
        const project = res;
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
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  private _getExtraAppData(project: Project, { getresponsibleEPD = false, getprojectLead = false }: GetParameters): Observable<Project> {
    return forkJoin(
      getresponsibleEPD ? this.searchService.getItem(project.responsibleEPDId.toString(), 'User') : of(null),
      getprojectLead ? this.searchService.getItem(project.projectLeadId.toString(), 'User') : of(null)
    ).pipe(
      map(payloads => {
        if (getresponsibleEPD) {
          project.responsibleEPDObj = payloads[0].data;
        }
        if (getprojectLead) {
          project.projectLeadObj = payloads[1].data;
        }
        // finally update the object and return
        return project;
      })
    );
  }

  public getPeopleObjs(data): Observable<any> {
    // Used in Full Project Resolver using current legislation as our key
    const projectSearchData = this.utils.extractFromSearchResults<FullProject>(data);
    if (!projectSearchData) {
      return of(data);
    }
    const fullProject = projectSearchData[0];
    if (!fullProject) {
      return of(data);
    }
    const projectKeys: number[] = fullProject.legislationYearList;
    const peopleObjs: Observable<any>[] = [];
    projectKeys.forEach(key => {
      const project = fullProject[`legislation_${key.toString()}`];
      if (!project || Object.keys(project).length === 0 || !project.name) {
        return of(data);
      }
      project.nature = this.utils.natureBuildMapper(project.build);

      const epdId = (project.responsibleEPDId) ? project.responsibleEPDId.toString() : '';
      const leadId = (project.projectLeadId) ? project.projectLeadId.toString() : '';
      if (!epdId && !leadId) {
        return of(data);
      }
      peopleObjs.push(forkJoin(
        this.searchService.getItem(epdId, 'User'),
        this.searchService.getItem(leadId, 'User')
      ).pipe(
        map(payloads => {
          if (payloads) {
            project.responsibleEPDObj = payloads[0].data;
            project.projectLeadObj = payloads[1].data;
            // finally update the object and return
          }
          return data;
        })
      ));
    });
    return (peopleObjs.length > 0) ? merge(...peopleObjs) : of(data);
  }

  // create new project
  add(item: Project): Observable<Project> {
    delete item._id;

    // replace newlines with \\n (JSON format)
    if (item.description) {
      item.description = item.description.replace(/\n/g, '\\n');
    }

    return this.api.addProject(item).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  // update existing project
  save(orig: Project): Observable<Project> {
    // make a (deep) copy of the passed-in project so we don't change it
    const proj = JSON.parse(JSON.stringify(orig));

    // replace newlines with \\n (JSON format)
    if (proj.description) {
      proj.description = proj.description.replace(/\n/g, '\\n');
    }

    return this.api.saveProject(proj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  delete(proj: Project): Observable<Project> {
    return this.api.deleteProject(proj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publish(proj: Project): Observable<Project> {
    return this.api.publishProject(proj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unPublish(proj: Project): Observable<Project> {
    return this.api.unPublishProject(proj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  addPins(proj: Project, pins: any): Observable<Project> {
    return this.api.addPinsToProject(proj, pins).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  addGroup(proj: Project, group: any): Observable<Project> {
    return this.api.addGroupToProject(proj, group).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  saveGroup(projectId: any, groupId: any, groupObj: any): Observable<Project> {
    return this.api.saveGroup(projectId, groupId, groupObj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deleteGroup(proj: Project, group: string): Observable<Project> {
    return this.api.deleteGroup(proj, group).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deletePin(projId: string, pin: string): Observable<Project> {
    return this.api.deletePin(projId, pin).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
  publishPins(projId: string): Observable<Project> {
    return this.api.publishPins(projId).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
  unpublishPins(projId: string): Observable<Project> {
    return this.api.unpublishPins(projId).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  getPins(proj: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    return this.api.getProjectPins(proj, pageNum, pageSize, sortBy).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  getGroupMembers(proj: string, groupId: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    return this.api.getProjectGroupMembers(proj, groupId, pageNum, pageSize, sortBy).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  addGroupMembers(proj: Project, groupId: string, members: any): Observable<Project> {
    return this.api.addMembersToGroup(proj, groupId, members).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deleteGroupMembers(projectId: string, groupId: string, member: string): Observable<Project> {
    return this.api.deleteMembersFromGroup(projectId, groupId, member).pipe(
      catchError(error => this.api.handleError(error))
    );
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
