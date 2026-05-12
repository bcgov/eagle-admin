import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, merge } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { SearchService } from './search.service';
import { CommentPeriod } from '../models/commentPeriod';
import { FullProject } from '../models/fullProject';
import { Org } from '../models/org';
import { Project } from '../models/project';
import { extractFromSearchResults, natureBuildMapper } from '../shared/utils/utils';


interface GetParameters {
  getresponsibleEPD?: boolean;
  getprojectLead?: boolean;
}

const PROJECT_FIELDS = [
  'CEAAInvolvement', 'CELead', 'CELeadEmail', 'CELeadPhone', 'centroid',
  'description', 'eacDecision', 'activeStatus', 'location', 'name',
  'projectLeadId', 'projectLead', 'projectLeadEmail', 'projectLeadPhone',
  'proponent', 'region', 'responsibleEPDId', 'responsibleEPD',
  'responsibleEPDEmail', 'responsibleEPDPhone', 'subtype', 'type',
  'addedBy', 'build', 'intake', 'CEAALink', 'code', 'eaDecision',
  'operational', 'substantiallyStarted', 'nature', 'commodity',
  'currentPhaseName', 'dateAdded', 'dateCommentsClosed', 'dateCommentsOpen',
  'dateUpdated', 'decisionDate', 'duration', 'eaoMember', 'epicProjectID',
  'fedElecDist', 'hasMetCommentPeriods', 'isTermsAgreed', 'overallProgress',
  'primaryContact', 'proMember', 'provElecDist', 'sector', 'shortName',
  'status', 'substantiallyDate', 'substantially', 'substitution',
  'eaStatus', 'eaStatusDate', 'projectStatusDate', 'activeDate',
  'updatedBy', 'projLead', 'execProjectDirector', 'complianceLead',
  'review180Start', 'review45Start', 'reviewSuspensions', 'reviewExtensions',
  'pins', 'read', 'write', 'delete'
];

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private api = inject(ApiService);
  private searchService = inject(SearchService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  private projectList: Project[] = [];

  getCount(): Observable<number> {
    return this.api.head('project', { observe: 'response' }).pipe(
      withLoading(this.loadingState, 'project-count'),
      map((res: any) => parseInt(res.headers.get('x-total-count'), 10)),
      catchError(error => {
        this.logger.error('Failed to get project count', 'ProjectService', error);
        this.toast.error('Failed to load project count.');
        return of(0);
      })
    );
  }

  getAll(pageNum = 1, pageSize = 20, sortBy: string = null): Observable<object> {
    const fields = [
      'eacDecision', 'name', 'proponent', 'region', 'type',
      'code', 'currentPhaseName', 'epicProjectID', 'decisionDate'
    ];
    let qs = `project?`;
    if (pageNum !== null) { qs += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { qs += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { qs += `sortBy=${sortBy}&`; }
    qs += `populate=true&fields=${this.api.buildValues(fields)}`;
    return this.api.get<any>(qs).pipe(
      withLoading(this.loadingState, 'projects-all'),
      map((res: any) => {
        if (res) {
          this.projectList = res[0].results.map((p: any) => new Project(p));
          return { totalCount: res[0].total_items, data: this.projectList };
        }
        return {};
      }),
      catchError(error => {
        this.logger.error('Failed to get projects', 'ProjectService', error);
        this.toast.error('Failed to load projects.');
        return of({});
      })
    );
  }

  getById(projId: string, cpStart: string = null, cpEnd: string = null): Observable<Project> {
    let qs = `project/${projId}?populate=true`;
    if (cpStart !== null) { qs += `&cpStart[since]=${cpStart}`; }
    if (cpEnd !== null) { qs += `&cpEnd[until]=${cpEnd}`; }
    qs += `&fields=${this.api.buildValues(PROJECT_FIELDS)}`;
    return this.api.get<Project[]>(qs).pipe(
      withLoading(this.loadingState, `project-${projId}`),
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
      mergeMap(res => {
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
      catchError(error => {
        this.logger.error(`Failed to get project ${projId}`, 'ProjectService', error);
        this.toast.error('Failed to load project.');
        return of(null as Project);
      })
    );
  }

  private _getExtraAppData(project: Project, { getresponsibleEPD = false, getprojectLead = false }: GetParameters): Observable<Project> {
    return forkJoin([
      getresponsibleEPD ? this.searchService.getItem(project.responsibleEPDId.toString(), 'User') : of(null),
      getprojectLead ? this.searchService.getItem(project.projectLeadId.toString(), 'User') : of(null)
    ]).pipe(
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
    const projectSearchData = extractFromSearchResults<FullProject>(data);
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
      project.nature = natureBuildMapper(project.build);

      const epdId = (project.responsibleEPDId) ? project.responsibleEPDId.toString() : '';
      const leadId = (project.projectLeadId) ? project.projectLeadId.toString() : '';
      if (!epdId && !leadId) {
        return of(data);
      }
      peopleObjs.push(forkJoin([
        this.searchService.getItem(epdId, 'User'),
        this.searchService.getItem(leadId, 'User')
      ]).pipe(
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
    if (item.description) {
      item.description = item.description.replace(/\n/g, '\\n');
    }
    return this.api.post<Project>('project/', item).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  // update existing project
  save(orig: Project): Observable<Project> {
    const proj = JSON.parse(JSON.stringify(orig));
    if (proj.description) {
      proj.description = proj.description.replace(/\n/g, '\\n');
    }
    return this.api.put<Project>(`project/${proj._id}`, proj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  delete(proj: Project): Observable<Project> {
    return this.api.delete<Project>(`project/${proj._id}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publish(proj: Project): Observable<Project> {
    return this.api.put<Project>(`project/${proj._id}/publish`, proj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unPublish(proj: Project): Observable<Project> {
    return this.api.put<Project>(`project/${proj._id}/unpublish`, proj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  addExtension(proj: Project, extension: any): Observable<any> {
    return this.api.post<any>(`project/${proj._id}/extension`, extension).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  editExtension(proj: Project, extension: any): Observable<any> {
    return this.api.put<any>(`project/${proj._id}/extension`, extension).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deleteExtension(proj: Project, extension: any): Observable<any> {
    const qs = `project/${proj._id}/extension?item=${encodeURIComponent(JSON.stringify(extension))}`;
    return this.api.delete<any>(qs).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  addPins(proj: Project, pins: any): Observable<Project> {
    return this.api.post<Project>(`project/${proj._id}/pin`, pins).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deletePin(projId: string, pin: string): Observable<Project> {
    return this.api.delete<Project>(`project/${projId}/pin/${pin}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  publishPins(projId: string): Observable<Project> {
    return this.api.put<Project>(`project/${projId}/pin/publish`, {}).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  unpublishPins(projId: string): Observable<Project> {
    return this.api.put<Project>(`project/${projId}/pin/unpublish`, {}).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  getPins(proj: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    let qs = `project/${proj}/pin`;
    if (pageNum !== null) { qs += `?pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { qs += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { qs += `&sortBy=${sortBy}`; }
    return this.api.get<any>(qs).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  addGroup(proj: Project, group: any): Observable<Project> {
    return this.api.post<Project>(`project/${proj._id}/group`, { group }).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  saveGroup(projectId: any, groupId: any, groupObj: any): Observable<Project> {
    return this.api.put<Project>(`project/${projectId}/group/${groupId}`, groupObj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deleteGroup(proj: Project, group: string): Observable<Project> {
    return this.api.delete<Project>(`project/${proj._id}/group/${group}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  getGroupMembers(proj: string, groupId: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    let qs = `project/${proj}/group/${groupId}/members`;
    if (pageNum !== null) { qs += `?pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { qs += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { qs += `&sortBy=${sortBy}`; }
    return this.api.get<any>(qs).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  addGroupMembers(proj: Project, groupId: string, members: any): Observable<Project> {
    return this.api.post<Project>(`project/${proj._id}/group/${groupId}/members`, members).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deleteGroupMembers(projectId: string, groupId: string, member: string): Observable<Project> {
    return this.api.delete<Project>(`project/${projectId}/group/${groupId}/members/${member}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }
}
