import { Injectable, inject } from '@angular/core';
import { Observable, of, merge, throwError } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { DemiApiService } from './demi-api.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';
import { CommentPeriod } from '../models/commentPeriod';
import { FullProject } from '../models/fullProject';
import { Project } from '../models/project';
import { DemiProject } from '../models/demi/project';
import { toLegacyProject } from '../models/demi/project-legacy';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { extractFromSearchResults, natureBuildMapper } from '../shared/utils/utils';

export const READ_ONLY_PROJECT = 'This project has no Eagle id, so it cannot be changed here.';

interface GetParameters {
  getresponsibleEPD?: boolean;
  getprojectLead?: boolean;
}

interface UserRow {
  id: string;
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
  private demiApi = inject(DemiApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  /** One page of DEMI projects, sorted by name unless `params.sort` says otherwise. */
  list(params: DemiListParams = {}): Observable<DemiList<DemiProject>> {
    return this.demiApi.list<DemiProject>('projects', { count: true, sort: 'name', ...params });
  }

  /** A DEMI project by DEMI id or Eagle id. */
  getNative(id: string): Observable<DemiProject> {
    return this.demiApi.get<DemiProject>('projects', id);
  }

  getUsers<T extends UserRow>(ids: string[]): Observable<T[]> {
    return this.demiApi.byIds<T>('users', ids);
  }

  getGroup<T>(groupId: string): Observable<T> {
    return this.demiApi.get<T>('groups', groupId);
  }

  /** Comment periods of one project. `demiProjectId` is the DEMI project id, not the Eagle id. */
  getCommentPeriods<T>(demiProjectId: string, params: DemiListParams = {}): Observable<DemiList<T>> {
    return this.demiApi.list<T>('comment-periods', {
      count: true,
      ...params,
      filters: { ...params.filters, project: demiProjectId }
    });
  }

  /** The project as eagle-api stores it, for the edit form. Reads `project/<eagleId>` until the form saves through DEMI. */
  getForEdit(projId: string): Observable<Project> {
    const qs = `project/${projId}?populate=true&fields=${this.api.buildValues(PROJECT_FIELDS)}`;
    return this.api.get<Project[]>(qs).pipe(
      withLoading(this.loadingState, `project-${projId}`),
      map(projects => {
        // get upcoming comment period if there is one and convert it into a comment period object.
        if (projects && projects.length > 0 && projects[0]) {
          if (projects[0].commentPeriodForBanner && projects[0].commentPeriodForBanner.length > 0) {
            projects[0].commentPeriodForBanner = new CommentPeriod(projects[0].commentPeriodForBanner[0]);
          } else {
            projects[0].commentPeriodForBanner = null;
          }
        }
        // return the first (only) project
        return projects && projects.length > 0 && projects[0] ? new Project(projects[0]) : null;
      }),
      mergeMap(res => {
        const project = res;
        if (!project) {
          return of(null as Project);
        }
        if (!project.projectLeadId && !project.responsibleEPDId) {
          return of(new Project(project));
        }
        // now get the rest of the data for this project
        return this._getExtraAppData(
          new Project(project),
          {
            getresponsibleEPD: !!project.responsibleEPDId,
            getprojectLead: !!project.projectLeadId
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
    const epdId = getresponsibleEPD ? project.responsibleEPDId.toString() : '';
    const leadId = getprojectLead ? project.projectLeadId.toString() : '';
    return this.usersById([epdId, leadId]).pipe(
      map(users => {
        if (getresponsibleEPD) {
          project.responsibleEPDObj = users.get(epdId);
        }
        if (getprojectLead) {
          project.projectLeadObj = users.get(leadId);
        }
        return project;
      })
    );
  }

  // Contact pickers and the edit forms read the Eagle `_id`; DEMI user ids are the Eagle ids.
  private usersById(ids: string[]): Observable<Map<string, UserRow & { _id: string }>> {
    return this.getUsers(ids).pipe(map(rows => new Map(rows.map(row => [row.id, { ...row, _id: row.id }]))));
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
      peopleObjs.push(this.usersById([epdId, leadId]).pipe(
        map(users => {
          project.responsibleEPDObj = users.get(epdId);
          project.projectLeadObj = users.get(leadId);
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
  save(orig: Project | DemiProject): Observable<Project> {
    return this.eagleWrite(orig, legacy => {
      const proj = JSON.parse(JSON.stringify(legacy));
      if (proj.description) {
        proj.description = proj.description.replace(/\n/g, '\\n');
      }
      return this.api.put<Project>(`project/${proj._id}`, proj);
    });
  }

  delete(proj: Project | DemiProject): Observable<Project> {
    return this.eagleWrite(proj, p => this.api.delete<Project>(`project/${p._id}`));
  }

  publish(proj: Project | DemiProject): Observable<Project> {
    return this.eagleWrite(proj, p => this.api.put<Project>(`project/${p._id}/publish`, p));
  }

  unPublish(proj: Project | DemiProject): Observable<Project> {
    return this.eagleWrite(proj, p => this.api.put<Project>(`project/${p._id}/unpublish`, p));
  }

  addExtension(proj: Project | DemiProject, extension: any): Observable<any> {
    return this.eagleWrite(proj, p => this.api.post<any>(`project/${p._id}/extension`, extension));
  }

  editExtension(proj: Project | DemiProject, extension: any): Observable<any> {
    return this.eagleWrite(proj, p => this.api.put<any>(`project/${p._id}/extension`, extension));
  }

  deleteExtension(proj: Project | DemiProject, extension: any): Observable<any> {
    return this.eagleWrite(proj, p =>
      this.api.delete<any>(`project/${p._id}/extension?item=${encodeURIComponent(JSON.stringify(extension))}`)
    );
  }

  addPins(proj: Project | DemiProject, pins: any): Observable<Project> {
    return this.eagleWrite(proj, p => this.api.post<Project>(`project/${p._id}/pin`, pins));
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

  addGroup(proj: Project | DemiProject, group: any): Observable<Project> {
    return this.eagleWrite(proj, p => this.api.post<Project>(`project/${p._id}/group`, { group }));
  }

  saveGroup(projectId: any, groupId: any, groupObj: any): Observable<Project> {
    return this.api.put<Project>(`project/${projectId}/group/${groupId}`, groupObj).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  deleteGroup(proj: Project | DemiProject, group: string): Observable<Project> {
    return this.eagleWrite(proj, p => this.api.delete<Project>(`project/${p._id}/group/${group}`));
  }

  addGroupMembers(proj: Project | DemiProject, groupId: string, members: any): Observable<Project> {
    return this.eagleWrite(proj, p => this.api.post<Project>(`project/${p._id}/group/${groupId}/members`, members));
  }

  deleteGroupMembers(projectId: string, groupId: string, member: string): Observable<Project> {
    return this.api.delete<Project>(`project/${projectId}/group/${groupId}/members/${member}`).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  /** Eagle writes key on the Eagle id: a DEMI row maps to the legacy project first, and one without an Eagle id is read-only. */
  private eagleWrite<T>(proj: Project | DemiProject, send: (legacy: Project) => Observable<T>): Observable<T> {
    const legacy = '_id' in proj ? proj as Project : toLegacyProject(proj as DemiProject);
    const request = legacy._id ? send(legacy) : throwError(() => new Error(READ_ONLY_PROJECT));
    return request.pipe(catchError(error => this.api.handleError(error)));
  }
}
