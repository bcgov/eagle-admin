import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { flatMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { CommentService } from './comment.service';
import { DecisionService } from './decision.service';

import { Project } from 'app/models/project';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Org } from 'app/models/org';

interface GetParameters {
  getFeatures?: boolean;
  getDocuments?: boolean;
  getCurrentPeriod?: boolean;
  getDecision?: boolean;
}

@Injectable()
export class ProjectService {
  private project: Project = null; // for caching
  private projectList: Project[] = [];

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService,
    private decisionService: DecisionService
  ) { }

  // get count of projects
  getCount(): Observable<number> {
    return this.api.getCountProjects()
      .catch(error => this.api.handleError(error));
  }

  // get all projects
  getAll(pageNum: number = 1, pageSize: number = 20, sortBy: string = null): Observable<Object> {
    return this.api.getProjects(pageNum, pageSize, sortBy)
      .map((res: any) => {
        if (res) {
          // let projects: Array<Project> = [];
          this.projectList = [];
          res[0].results.forEach(project => {
            this.projectList.push(new Project(project));
          });
          return { totalCount: res[0].total_items, data: this.projectList };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  getById(projId: string, cpStart: string = null, cpEnd: string = null): Observable<Project> {
    return this.api.getProject(projId, cpStart, cpEnd)
      .map(projects => {

        // get upcoming comment period if there is one and convert it into a comment period object.
        if (projects[0].commentPeriodForBanner && projects[0].commentPeriodForBanner.length > 0) {
          projects[0].commentPeriodForBanner = new CommentPeriod(projects[0].commentPeriodForBanner[0]);
        } else {
          projects[0].commentPeriodForBanner = null;
        }

        // return the first (only) project
        return projects.length > 0 ? new Project(projects[0]) : null;
      })
      .catch(error => this.api.handleError(error));
  }

  private _getExtraAppData(project: Project, { getFeatures = false, getDocuments = false, getCurrentPeriod = false, getDecision = false }: GetParameters): Observable<Project> {
    return forkJoin(
      // getFeatures ? this.featureService.getByProjectId(project._id) : of(null),
      // getDocuments ? this.documentService.getAllByProjectId(project._id) : of(null),
      // getCurrentPeriod ? this.commentPeriodService.getAllByProjectId(project._id) : of(null),
      // getDecision ? this.decisionService.getByProjectId(project._id, { getDocuments: true }) : of(null)
    )
      .map(payloads => {
        if (getFeatures) {
          // project.features = payloads[0];
        }

        if (getDocuments) {
          // project.documents = payloads[1];
        }

        if (getCurrentPeriod) {
          const periods: Array<CommentPeriod> = payloads[2];
          // project.currentPeriods = this.commentPeriodService.getCurrent(periods);

          // user-friendly comment period status
          // project.cpStatus = this.commentPeriodService.getStatus(project.currentPeriods);

          // derive days remaining for display
          // use moment to handle Daylight Saving Time changes
          // if (project.currentPeriods && this.commentPeriodService.isOpen(project.currentPeriods)) {
          //   const now = new Date();
          //   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          //   project.currentPeriods['daysRemaining']
          //     = moment(project.currentPeriods.endDate).diff(moment(today), 'days') + 1; // including today
          // }

          // get the number of comments for the current comment period only
          // multiple comment periods are currently not supported
          // if (project.currentPeriods) {
          //   this.commentService.getCountByPeriodId(project.currentPeriods._id)
          //     .subscribe(
          //       numComments => {
          //         project['numComments'] = numComments;
          //       }
          //     );
          // }
        }

        if (getDecision) {
          // project.decision = payloads[3];
        }

        // 7-digit CL File number for display
        // if (project.cl_file) {
        //   project['clFile'] = project.cl_file.toString().padStart(7, '0');
        // }

        // user-friendly project status
        // project.projStatus = this.getStatusString(this.getStatusCode(project.status));

        // derive region code
        // project.region = this.getRegionCode(project.businessUnit);

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
