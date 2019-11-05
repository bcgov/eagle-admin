import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Params } from '@angular/router';
// import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as JSZip from 'jszip';

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
import { Utils } from 'app/shared/utils/utils';

interface LocalLoginResponse {
  _id: string;
  title: string;
  created_at: string;
  startTime: string;
  endTime: string;
  state: boolean;
  accessToken: string;
}

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
    private keycloakService: KeycloakService,
    private utils: Utils
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
      case 'eagle-test.pathfinder.gov.bc.ca':
      case 'esm-test.pathfinder.gov.bc.ca':
        // Test
        this.pathAPI = 'https://eagle-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
        break;

      case 'www.projects.eao.gov.bc.ca':
      case 'eagle-prod.pathfinder.gov.bc.ca':
      case 'projects.eao.gov.bc.ca':
        // Test
        this.pathAPI = 'https://eagle-prod.pathfinder.gov.bc.ca/api';
        this.env = 'prod';
        break;

      default:
        // test
        this.pathAPI = 'https://eagle-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
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
          window.localStorage.clear();
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
      'projectLeadId',
      'projectLead',
      'projectLeadEmail',
      'projectLeadPhone',
      'proponent',
      'region',
      'responsibleEPDId',
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

  addGroupToProject(proj: Project, group: any): Observable<Project> {
    const queryString = `project/${proj._id}/group`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, { group: group }, {});
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

  getProjectGroupMembers(id: string, groupId: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    let queryString = `project/${id}/group/${groupId}/members`;
    if (pageNum !== null) { queryString += `?pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, {});
  }

  addMembersToGroup(proj: Project, groupId: string, members: any): Observable<Project> {
    const queryString = `project/${proj._id}/group/${groupId}/members`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, members, {});
  }

  deleteMembersFromGroup(projId: string, groupId: string, member: string): Observable<Project> {
    const queryString = `project/${projId}/group/${groupId}/members/${member}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
  }

  saveGroup(projectId: Project, groupId: any, groupObj: any): Observable<Project> {
    const queryString = `project/${projectId}/group/${groupId}`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, groupObj, {});
  }

  deleteGroup(proj: Project, groupId: string): Observable<Project> {
    const queryString = `project/${proj._id}/group/${groupId}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
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
      'documentAuthorType',
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
      'documentAuthorType',
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
    filename = this.utils.encodeFilename(filename, false);
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

  public async exportComments(period: String, projectName: String, format: String) {
    const queryString = `comment/export/${period}?format=${format}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();

    projectName = projectName.split(' ').join('_');
    let currentDate = this.utils.formatDate(new Date());
    let filename = '';
    if (format === 'staff') {
      filename = projectName + '-eao-' + currentDate + '.csv';
    } else if (format === 'proponent') {
      filename = projectName + '-proponent-' + currentDate + '.csv';
    } else {
      filename = 'export.csv';
    }

    filename = this.utils.encodeFilename(filename, true);
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
    filename = this.utils.encodeFilename(filename, true);
    window.open('/api/document/' + document._id + '/fetch/' + filename, '_blank');
  }

  public downloadElementThumbnail(inspectionId: string, elementId: string, itemId: string): Promise<Blob> {
    const queryString = `inspection/${inspectionId}/${elementId}/${itemId}?thumbnail=true`;
    return this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
  }

  public async openElementResource(element: any): Promise<void> {
    let filename = element.internalURL.substring(element.internalURL.lastIndexOf('/') + 1);
    window.open(`/api/inspection/element/${element._id}/${filename}`, '_blank');
  }

  public async downloadInspectionItem(inspection, elementId, item: any): Promise<void> {
    let tempDate = new Date(item.timestamp);
    let filename = `${inspection.name}_${this.utils.getFormattedTime(tempDate)}`;
    filename = filename.replace('.', '-');
    const queryString = `inspection/${inspection._id}/${elementId}/${item._id}?filename=${filename}`;
    let blob = null;
    try {
      blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
    } catch {
      alert('An error has occured.');
      throw Error('Unable to download item');
    }
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

  public async downloadInspection(inspection: any): Promise<void> {
    // inspectionA
    // - Element1
    //   - element.txt
    //   - photo.jpg
    //   - photo.jpg
    //   - photo.video.... etc
    // - Element2
    //   - element.txt
    //   -voice.rec
    // - Element3

    let zip = new JSZip();
    zip.file(
      `inspection.txt`,
      `
      Name: ${inspection.name}\n
      Inspection Number: ${inspection.case}\n
      Inspector email: ${inspection.email}\n
      Start Date: ${inspection.startDate}\n
      End Date: ${inspection.endDate}\n
      Project: ${inspection.project.name}\n
      `
    );

    for (let i = 0; i < inspection.elements.length; i++) {
      let element = inspection.elements[i];
      let elementFolder = zip.folder(element.title);
      elementFolder.file(
        `element.txt`,
        `
        Description: ${element.description}\n
        Requirement: ${element.requirement}\n
        Timestamp: ${element.timestamp}\n
        `
      );

      for (let j = 0; j < element.items.length; j++) {
        const itemQueryString = `search?dataset=Item&_id=${element.items[j]}&_schemaName=${'InspectionItem'}`;
        let itemSearchResults = null;
        try {
          itemSearchResults = await this.http.get<any[]>(`${this.pathAPI}/${itemQueryString}`, {}).toPromise();
          console.log('SEARCH RES', itemSearchResults);
        } catch {
          alert('An error has occured.');
          throw Error('Unable to find inspection item.');
        }

        let item = itemSearchResults[0];
        let tempDate = new Date(item.timestamp);
        let filename = `${inspection.name}_${this.utils.getFormattedTime(tempDate)}.${item.internalExt}`;
        const queryString = `inspection/${inspection._id}/${element._id}/${item._id}?filename=${filename}`;
        let blob = null;
        try {
          blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
        } catch {
          alert('An error has occured.');
          throw Error('Unable to get asset.');
        }

        elementFolder.file(
          `${filename}_caption.txt`,
          `
          ${item.caption}
          `
        );
        elementFolder.file(filename, blob, { base64: true });
      }
    }
    let content = null;

    try {
      content = await zip.generateAsync({ type: 'blob' });
    } catch {
      alert('An error has occured.');
      throw Error('Unable to generate zip file.');

    }
    if (this.isMS) {
      window.navigator.msSaveBlob(content, 'example.zip');
    } else {
      const url = window.URL.createObjectURL(content);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = 'example.zip';
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
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
  saveUser(user: User): Observable<User> {
    const queryString = `user/${user._id}`;
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  addUser(user: User): Observable<User> {
    const queryString = `user/`;
    return this.http.post<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  // Organizations

  getOrgsByCompanyType(type: string): Observable<Org[]> {
    const fields = [
      'name'
    ];

    const queryString = `organization?companyType=${type}&sortBy=+name&fields=${this.buildValues(fields)}`;
    return this.http.get<Org[]>(`${this.pathAPI}/${queryString}`, {});
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
