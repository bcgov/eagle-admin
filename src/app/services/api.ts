import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Params } from '@angular/router';
// import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { KeycloakService } from 'app/services/keycloak.service';

import { Project } from 'app/models/project';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Decision } from 'app/models/decision';
import { Document } from 'app/models/document';
// import { Feature } from 'app/models/recentActivity';
import { SearchResults } from 'app/models/search';
import { User } from 'app/models/user';
import { Topic } from 'app/models/topic';
import { Org } from 'app/models/org';
import { RecentActivity } from 'app/models/recentActivity';
import { ValuedComponent } from 'app/models/valuedComponent';
import { CommentPeriodSummary } from 'app/models/commentPeriodSummary';

interface LocalLoginResponse {
  _id: string;
  title: string;
  created_at: string;
  startTime: string;
  endTime: string;
  state: boolean;
  accessToken: string;
}

const encode = encodeURIComponent;
window['encodeURIComponent'] = (component: string) => {
  return encode(component).replace(/[!'()*]/g, (c) => {
    // Also encode !, ', (, ), and *
    return '%' + c.charCodeAt(0).toString(16);
  });
};

@Injectable()
export class ApiService {

  public token: string;
  public isMS: boolean; // IE, Edge, etc
  // private jwtHelper: JwtHelperService;
  pathAPI: string;
  params: Params;
  env: 'local' | 'dev' | 'test' | 'demo' | 'scale' | 'beta' | 'master' | 'prod';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {
    // this.jwtHelper = new JwtHelperService();
    const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;

    const { hostname } = window.location;
    switch (hostname) {
      case 'localhost':
        // Local
        this.pathAPI = 'http://localhost:3000/api';
        this.env = 'local';
        break;

      case 'eagle-dev.pathfinder.gov.bc.ca':
        // Prod
        this.pathAPI = 'https://eagle-dev.pathfinder.gov.bc.ca/api';
        this.env = 'dev';
        break;

      case 'test.projects.eao.gov.bc.ca':
      case 'www.test.projects.eao.gov.bc.ca':
      case 'eagle-test.projects.eao.gov.bc.ca':
        // Test
        this.pathAPI = 'https://eagle-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
        break;

      case 'www.projects.eao.gov.bc.ca':
      case 'projects.eao.gov.bc.ca':
        // Test
        this.pathAPI = 'https://eagle-prod.pathfinder.gov.bc.ca/api';
        this.env = 'prod';
        break;

      default:
        // Dev
        this.pathAPI = 'https://eagle-prod.pathfinder.gov.bc.ca/api';
        this.env = 'prod';
    }
  }

  handleError(error: any): Observable<never> {
    const reason = error.message ? (error.error ? `${error.message} - ${error.error.message}` : error.message) : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log('API error =', reason);
    if (error && error.status === 403 && !this.keycloakService.isKeyCloakEnabled()) {
      window.location.href = '/admin/login';
    }
    return throwError(error);
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LocalLoginResponse>(`${this.pathAPI}/login/token`, { username: username, password: password })
      .map(res => {
        // login successful if there's a jwt token in the response
        if (res && res.accessToken) {
          this.token = res.accessToken;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          window.localStorage.setItem('currentUser', JSON.stringify({ username: username, token: this.token }));

          return true; // successful login
        }
        return false; // failed login
      });
  }

  logout() {
    // clear token + remove user from local storage to log user out
    this.token = null;
    window.localStorage.removeItem('currentUser');
  }

  //
  // Projects
  //
  getProjects(pageNum: number, pageSize: number, sortBy: string, populate: Boolean = true): Observable<Object> {
    const fields = [
      'eacDecision',
      'name',
      'proponent',
      'region',
      'type',
      'code',
      'currentPhaseName',
      'epicProjectID',
      'decisionDate'
    ];

    let queryString = `project?`;
    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    if (populate !== null) { queryString += `populate=${populate}&`; }
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  getFullDataSet(dataSet: string): Observable<any> {
    return this.http.get<any>(`${this.pathAPI}/search?pageSize=1000&dataset=${dataSet}`, {});
  }

  // NB: returns array with 1 element
  getProject(id: string, cpStart: string, cpEnd: string): Observable<Project[]> {
    const fields = [
      'CEAAInvolvement',
      'CELead',
      'CELeadEmail',
      'CELeadPhone',
      'centroid',
      'description',
      'eacDecision',
      'activeStatus',
      'location',
      'name',
      'projectLead',
      'projectLeadEmail',
      'projectLeadPhone',
      'proponent',
      'region',
      'responsibleEPD',
      'responsibleEPDEmail',
      'responsibleEPDPhone',
      'subtype',
      'type',
      'addedBy',
      'build',
      'intake',
      'CEAALink',
      'code',
      'eaDecision',
      'operational',
      'substantiallyStarted',
      'nature',
      'commodity',
      'currentPhaseName',
      'dateAdded',
      'dateCommentsClosed',
      'dateCommentsOpen',
      'dateUpdated',
      'decisionDate',
      'duration',
      'eaoMember',
      'epicProjectID',
      'fedElecDist',
      'isTermsAgreed',
      'overallProgress',
      'primaryContact',
      'proMember',
      'provElecDist',
      'sector',
      'shortName',
      'status',
      'substantiallyDate',
      'substantially',
      'substitution',
      'eaStatus',
      'eaStatusDate',
      'projectStatusDate',
      'activeDate',
      'updatedBy',
      'projLead',
      'execProjectDirector',
      'complianceLead',
      'pins',
      'read',
      'write',
      'delete'
    ];
    let queryString = `project/${id}?populate=true`;
    if (cpStart !== null) { queryString += `&cpStart[since]=${cpStart}`; }
    if (cpEnd !== null) { queryString += `&cpEnd[until]=${cpEnd}`; }
    queryString += `&fields=${this.buildValues(fields)}`;
    return this.http.get<Project[]>(`${this.pathAPI}/${queryString}`, {});
  }

  getCountProjects(): Observable<number> {
    const queryString = `project`;
    return this.http.head<HttpResponse<Object>>(`${this.pathAPI}/${queryString}`, { observe: 'response' })
      .pipe(
        map(res => {
          // retrieve the count from the response headers
          return parseInt(res.headers.get('x-total-count'), 10);
        })
      );
  }

  addProject(proj: Project): Observable<Project> {
    const queryString = `project/`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  publishProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}/publish`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  unPublishProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}/unpublish`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  deleteProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
  }

  addPinsToProject(proj: Project, pins: any): Observable<Project> {
    const queryString = `project/${proj._id}/pin`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, pins, {});
  }

  deletePin(projId: string, pinId: string): Observable<Project> {
    const queryString = `project/${projId}/pin/${pinId}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
  }

  getProjectPins(id: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    let queryString = `project/${id}/pin`;
    if (pageNum !== null) { queryString += `?pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, {});
  }

  saveProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  // //
  // // Features
  // //
  // getFeaturesByTantalisId(tantalisId: number): Observable<Feature[]> {
  //   const fields = [
  //     'type',
  //     'tags',
  //     'geometry',
  //     'geometryName',
  //     'properties',
  //     'isDeleted',
  //     'projectID'
  //   ];
  //   const queryString = `feature?isDeleted=false&tantalisId=${tantalisId}&fields=${this.buildValues(fields)}`;
  //   return this.http.get<Feature[]>(`${this.pathAPI}/${queryString}`, {});
  // }

  // getFeaturesByProjectId(projectId: string): Observable<Feature[]> {
  //   const fields = [
  //     'type',
  //     'tags',
  //     'geometry',
  //     'geometryName',
  //     'properties',
  //     'isDeleted',
  //     'projectID'
  //   ];
  //   const queryString = `feature?isDeleted=false&projectId=${projectId}&fields=${this.buildValues(fields)}`;
  //   return this.http.get<Feature[]>(`${this.pathAPI}/${queryString}`, {});
  // }

  // deleteFeaturesByProjectId(projectID: string): Observable<Object> {
  //   const queryString = `feature/?projectID=${projectID}`;
  //   return this.http.delete(`${this.pathAPI}/${queryString}`, {});
  // }

  //
  // Decisions
  //
  getDecisionsByAppId(projId: string): Observable<Decision[]> {
    const fields = [
      '_addedBy',
      '_project',
      'code',
      'name',
      'description'
    ];
    const queryString = `decision?_project=${projId}&fields=${this.buildValues(fields)}`;
    return this.http.get<Decision[]>(`${this.pathAPI}/${queryString}`, {});
  }

  // NB: returns array with 1 element
  getDecision(id: string): Observable<Decision[]> {
    const fields = [
      '_addedBy',
      '_project',
      'code',
      'name',
      'description'
    ];
    const queryString = `decision/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<Decision[]>(`${this.pathAPI}/${queryString}`, {});
  }

  addDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/`;
    return this.http.post<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  saveDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}`;
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  deleteDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}`;
    return this.http.delete<Decision>(`${this.pathAPI}/${queryString}`, {});
  }

  publishDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}/publish`;
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  unPublishDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}/unpublish`;
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  //
  // Comment Periods
  //
  getPeriodsByProjId(projId: string, pageNum: number, pageSize: number, sortBy: string): Observable<Object> {
    const fields = [
      'project',
      'dateStarted',
      'dateCompleted'
    ];

    let queryString = `commentperiod?&project=${projId}&`;
    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    queryString += `count=true&`;
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  // NB: returns array with 1 element
  getPeriod(id: string): Observable<CommentPeriod[]> {
    const fields = [
      '_id',
      '__v',
      '_schemaName',
      'addedBy',
      'additionalText',
      'ceaaAdditionalText',
      'ceaaInformationLabel',
      'ceaaRelatedDocuments',
      'classificationRoles',
      'classifiedPercent',
      'commenterRoles',
      'dateAdded',
      'dateCompleted',
      'dateCompletedEst',
      'dateStarted',
      'dateStartedEst',
      'dateUpdated',
      'downloadRoles',
      'informationLabel',
      'instructions',
      'isClassified',
      'isPublished',
      'isResolved',
      'isVetted',
      'milestone',
      'openCommentPeriod',
      'openHouses',
      'periodType',
      'phase',
      'phaseName',
      'project',
      'publishedPercent',
      'rangeOption',
      'rangeType',
      'relatedDocuments',
      'resolvedPercent',
      'updatedBy',
      'userCan',
      'vettedPercent',
      'vettingRoles'
    ];
    const queryString = `commentperiod/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<CommentPeriod[]>(`${this.pathAPI}/${queryString}`, {});
  }

  getPeriodSummary(id: string): Observable<CommentPeriodSummary> {
    const fields = [
      '_id',
      '__v',
      '_schemaName',
      'addedBy',
      'additionalText',
      'ceaaAdditionalText',
      'ceaaInformationLabel',
      'ceaaRelatedDocuments',
      'classificationRoles',
      'classifiedPercent',
      'commenterRoles',
      'dateAdded',
      'dateCompleted',
      'dateCompletedEst',
      'dateStarted',
      'dateStartedEst',
      'dateUpdated',
      'downloadRoles',
      'informationLabel',
      'instructions',
      'isClassified',
      'isPublished',
      'isResolved',
      'isVetted',
      'milestone',
      'openCommentPeriod',
      'openHouses',
      'periodType',
      'phase',
      'phaseName',
      'project',
      'publishedPercent',
      'rangeOption',
      'rangeType',
      'relatedDocuments',
      'resolvedPercent',
      'updatedBy',
      'userCan',
      'vettedPercent',
      'vettingRoles'
    ];
    const queryString = `commentperiod/${id}/summary?fields=${this.buildValues(fields)}`;
    return this.http.get<CommentPeriodSummary>(`${this.pathAPI}/${queryString}`, {});
  }

  addCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/`;
    return this.http.post<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  saveCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  deleteCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}`;
    return this.http.delete<CommentPeriod>(`${this.pathAPI}/${queryString}`, {});
  }

  publishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}/publish`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  unPublishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}/unpublish`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  //
  // Topics
  //
  getTopics(pageNum: number, pageSize: number, sortBy: string): Observable<Object> {
    const fields = [
      'description',
      'name',
      'type',
      'pillar',
      'parent'
    ];

    let queryString = `topic?`;
    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }
  getTopic(id: string): Observable<Topic[]> {
    const fields = [
      'description',
      'name',
      'type',
      'pillar',
      'parent'
    ];
    const queryString = `topic/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<Topic[]>(`${this.pathAPI}/${queryString}`, {});
  }

  addTopic(topic: Topic): Observable<Topic> {
    const queryString = `topic/`;
    return this.http.post<Topic>(`${this.pathAPI}/${queryString}`, topic, {});
  }

  saveTopic(topic: Topic): Observable<Topic> {
    const queryString = `topic/${topic._id}`;
    return this.http.put<Topic>(`${this.pathAPI}/${queryString}`, topic, {});
  }

  deleteTopic(topic: Topic): Observable<Topic> {
    const queryString = `topic/${topic._id}`;
    return this.http.delete<Topic>(`${this.pathAPI}/${queryString}`, {});
  }


  //
  // Comments
  //
  getCountCommentsByPeriodId(periodId: string): Observable<number> {
    // NB: count only pending comments
    const queryString = `comment?isDeleted=false&commentStatus='Pending'&_commentPeriod=${periodId}`;
    return this.http.head<HttpResponse<Object>>(`${this.pathAPI}/${queryString}`, { observe: 'response' })
      .pipe(
        map(res => {
          // retrieve the count from the response headers
          return parseInt(res.headers.get('x-total-count'), 10);
        })
      );
  }

  getCommentsByPeriodId(periodId: string, pageNum: number, pageSize: number, sortBy: string, count: boolean, filter: object): Observable<Object> {
    const fields = [
      '_id',
      'author',
      'comment',
      'commentId',
      'dateAdded',
      'dateUpdated',
      'documents',
      'isAnonymous',
      'location',
      'eaoStatus',
      'period',
      'read'
    ];

    let queryString = `comment?&period=${periodId}`;
    if (pageNum !== null) { queryString += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    if (count !== null) { queryString += `&count=${count}`; }
    if (filter !== {}) {
      Object.keys(filter).forEach(key => {
        queryString += `&${key}=${filter[key]}`;
      });
    }
    queryString += `&fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  // NB: returns array with 1 element
  getComment(id: string, populateNextComment: boolean): Observable<any> {
    const fields = [
      '_id',
      'author',
      'comment',
      'commentId',
      'dateAdded',
      'datePosted',
      'dateUpdated',
      'documents',
      'eaoNotes',
      'eaoStatus',
      'isAnonymous',
      'location',
      'period',
      'proponentNotes',
      'proponentStatus',
      'publishedNotes',
      'rejectedNotes',
      'rejectedReason',
      'valuedComponents',
      'read',
      'write',
      'delete'
    ];
    let queryString = `comment/${id}?fields=${this.buildValues(fields)}`;
    if (populateNextComment) { queryString += '&populateNextComment=true'; }
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, { observe: 'response' });
  }

  addComment(comment: Comment): Observable<Comment> {
    const queryString = `comment/`;
    return this.http.post<Comment>(`${this.pathAPI}/${queryString}`, comment, {});
  }

  saveComment(comment: Comment): Observable<Comment> {
    const queryString = `comment/${comment._id}`;
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, comment, {});
  }

  updateCommentStatus(comment: Comment, status: string): Observable<Comment> {
    const queryString = `comment/${comment._id}/status`;
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, { 'status': status }, {});
  }

  //
  // Documents
  //
  getDocumentsByAppId(projId: string): Observable<Document[]> {
    const fields = [
      '_project',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = `document?isDeleted=false&_project=${projId}&fields=${this.buildValues(fields)}`;
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, {});
  }

  getDocumentsByMultiId(ids: Array<String>): Observable<Document[]> {
    const fields = [
      '_id',
      'eaoStatus',
      'internalOriginalName',
      'documentFileName',
      'labels',
      'internalOriginalName',
      'internalSize',
      'displayName',
      'documentType',
      'datePosted',
      'dateUploaded',
      'dateReceived',
      'documentSource',
      'internalURL',
      'internalMime',
      'checkbox',
      'project',
      'type',
      'documentAuthor',
      'projectPhase',
      'milestone',
      'description',
      'isPublished'
    ];
    const queryString = `document?docIds=${this.buildValues(ids)}&fields=${this.buildValues(fields)}`;
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, {});
  }

  // NB: returns array with 1 element
  getDocument(id: string): Observable<Document[]> {
    const fields = [
      '_addedBy',
      'documentFileName',
      'labels',
      'internalOriginalName',
      'displayName',
      'documentType',
      'datePosted',
      'dateUploaded',
      'dateReceived',
      'documentSource',
      'internalURL',
      'internalMime',
      'internalSize',
      'checkbox',
      'project',
      'type',
      'documentAuthor',
      'projectPhase',
      'milestone',
      'description',
      'isPublished'
    ];
    const queryString = `document/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, {});
  }

  updateDocument(formData: FormData, _id: any): Observable<Document> {
    const queryString = `document/${_id}`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, formData, {});
  }

  deleteDocument(doc: Document): Observable<Document> {
    const queryString = `document/${doc._id}`;
    return this.http.delete<Document>(`${this.pathAPI}/${queryString}`, {});
  }

  publishDocument(docId: String): Observable<Document> {
    const queryString = `document/${docId}/publish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, {}, {});
  }

  unPublishDocument(docId: String): Observable<Document> {
    const queryString = `document/${docId}/unpublish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, {}, {});
  }

  uploadDocument(formData: FormData): Observable<Document> {
    const fields = [
      'documentFileName',
      'internalOriginalName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = `document?fields=${this.buildValues(fields)}`;
    return this.http.post<Document>(`${this.pathAPI}/${queryString}`, formData, {});
  }

  private downloadResource(id: string): Promise<Blob> {
    const queryString = `document/${id}/download`;
    return this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
  }

  public async downloadDocument(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    let filename;
    if (document.documentSource === 'COMMENT') {
      filename = document.internalOriginalName;
    } else {
      filename = document.documentFileName;
    }
    filename = filename.replace(/\\/g, '_').replace(/\//g, '_');
    if (this.isMS) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }

  public async exportComments(period: String) {
    const queryString = `comment/export/${period}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
    let filename = 'export.csv';
    filename = filename.replace(/\\/g, '_').replace(/\//g, '_');
    if (this.isMS) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }

  public async openDocument(document: Document): Promise<void> {
    let filename;
    if (document.documentSource === 'COMMENT') {
      filename = document.internalOriginalName;
    } else {
      filename = document.documentFileName;
    }
    filename = encode(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_');
    window.open('/api/document/' + document._id + '/fetch/' + filename, '_blank');
  }

  //
  // Valued Component
  //
  getValuedComponents(): Observable<ValuedComponent[]> {
    const fields = [
      '_id',
      '_schemaName',
      'code',
      'description',
      'name',
      'parent',
      'pillar',
      'project',
      'stage',
      'title',
      'type'];
    // NB: max 1000 records
    const queryString = `vc?fields=${this.buildValues(fields)}`;
    return this.http.get<ValuedComponent[]>(`${this.pathAPI}/${queryString}`, {});
  }
  getValuedComponentsByProjectId(projectId: String, pageNum: number, pageSize: number, sortBy: string = null): Observable<Object> {
    const fields = [
      '_id',
      '_schemaName',
      'code',
      'description',
      'name',
      'parent',
      'pillar',
      'project',
      'stage',
      'title',
      'type'];

    let queryString = `vc?projectId=${projectId}`;
    if (pageNum !== null) { queryString += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    queryString += `&fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }
  addVCToProject(vc: any, project: any): Observable<ValuedComponent> {
    const queryString = `vc/`;
    return this.http.post<ValuedComponent>(`${this.pathAPI}/${queryString}`, vc, {});
  }
  deleteVC(vc: any): Observable<ValuedComponent> {
    const queryString = `vc/${vc._id}`;
    return this.http.delete<ValuedComponent>(`${this.pathAPI}/${queryString}`, {});
  }

  //
  // Get Item via search endpoint
  //
  getItem(_id: string, schema: string): Observable<SearchResults[]> {
    let queryString = `search?dataset=Item&_id=${_id}&_schemaName=${schema}`;
    return this.http.get<SearchResults[]>(`${this.pathAPI}/${queryString}`, {});
  }

  //
  // Searching
  //
  searchKeywords(keys: string, dataset: string, fields: any[], pageNum: number, pageSize: number, sortBy: string = null, queryModifier: object = {}, populate = false, filter = {}): Observable<SearchResults[]> {
    let queryString = `search?dataset=${dataset}`;
    if (fields && fields.length > 0) {
      fields.map(item => {
        queryString += `&${item.name}=${item.value}`;
      });
    }
    if (keys) {
      queryString += `&keywords=${keys}`;
    }
    if (pageNum !== null) { queryString += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    if (populate !== null) { queryString += `&populate=${populate}`; }
    if (queryModifier !== {}) {
      Object.keys(queryModifier).map(key => {
        queryModifier[key].split(',').map(item => {
          queryString += `&and[${key}]=${item}`;
        });
      });
    }
    if (filter !== {}) {
      Object.keys(filter).map(key => {
        filter[key].split(',').map(item => {
          queryString += `&or[${key}]=${item}`;
        });
      });
    }
    queryString += `&fields=${this.buildValues(fields)}`;
    return this.http.get<SearchResults[]>(`${this.pathAPI}/${queryString}`, {});
  }

  //
  // Metrics
  //
  getMetrics(pageNum: number, pageSize: number, sortBy: string = null): Observable<SearchResults[]> {
    let queryString = `audit?`;
    let fields = ['fields',
      'performedBy',
      'deletedBy',
      'updatedBy',
      'addedBy',
      'meta',
      'action',
      'objId',
      'keywords',
      'timestamp',
      '_objectSchema'];

    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    queryString += `fields=${this.buildValues(fields)}`;
    return this.http.get<SearchResults[]>(`${this.pathAPI}/${queryString}`, {});
  }

  // Activity
  addRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/`;
    return this.http.post<RecentActivity>(`${this.pathAPI}/${queryString}`, recentActivity, {});
  }

  saveRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/${recentActivity._id}`;
    return this.http.put<RecentActivity>(`${this.pathAPI}/${queryString}`, recentActivity, {});
  }

  deleteRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/${recentActivity._id}`;
    return this.http.delete<RecentActivity>(`${this.pathAPI}/${queryString}`, {});
  }


  //
  // Users
  //
  getUsers(): Observable<User[]> {
    const fields = [
      'displayName',
      'username',
      'firstName',
      'lastName'
    ];
    const queryString = `user?fields=${this.buildValues(fields)}`;
    return this.http.get<User[]>(`${this.pathAPI}/${queryString}`, {});
  }

  getUser(id: any): Observable<User> {
    const fields = [
      'displayName',
      'username',
      'firstName',
      'lastName',
      'org',
      'phoneNumber',
      'email',
    ];
    const queryString = `user/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<User>(`${this.pathAPI}/${queryString}`, {});
  }

  saveUser(user: User): Observable<User> {
    const queryString = `user/${user._id}`;
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  addUser(user: User): Observable<User> {
    const queryString = `user/`;
    return this.http.post<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  getOrgs(): Observable<Org[]> {
    const fields = [
      'displayName',
      'username',
      'firstName',
      'lastName'
    ];
    const queryString = `organization?fields=${this.buildValues(fields)}`;
    return this.http.get<Org[]>(`${this.pathAPI}/${queryString}`, {});
  }

  getOrg(id: any): Observable<Org> {
    const queryString = `organization/${id}`;
    return this.http.get<Org>(`${this.pathAPI}/${queryString}`, {});
  }

  saveOrg(org: Org): Observable<Org> {
    const queryString = `organization/${org._id}`;
    return this.http.put<Org>(`${this.pathAPI}/${queryString}`, org, {});
  }

  addOrg(org: Org): Observable<Org> {
    const queryString = `organization/`;
    return this.http.post<Org>(`${this.pathAPI}/${queryString}`, org, {});
  }

  //
  // Local helpers
  //
  private buildValues(collection: any[]): string {
    let values = '';
    _.each(collection, function (a) {
      values += a + '|';
    });
    // trim the last |
    return values.replace(/\|$/, '');
  }
}
