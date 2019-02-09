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
import { FeatureService } from './feature.service';

import { Project } from 'app/models/project';
import { CommentPeriod } from 'app/models/commentperiod';

interface GetParameters {
  getFeatures?: boolean;
  getDocuments?: boolean;
  getCurrentPeriod?: boolean;
  getDecision?: boolean;
}

@Injectable()
export class ProjectService {
  private project: Project = null; // for caching

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService,
    private decisionService: DecisionService,
    private featureService: FeatureService
  ) { }

  // get count of projects
  getCount(): Observable<number> {
    return this.api.getCountProjects()
      .catch(error => this.api.handleError(error));
  }

  // get all projects
  getAll(params: GetParameters = null): Observable<Project[]> {
    // first get just the projects
    return this.api.getProjects()
    .map(projects => {
      // const projects = res.text() ? res.json() : [];
      projects.forEach((project, i) => {
        projects[i] = new Project(project);
        // FUTURE: derive region code, etc ?
      });
      return projects;
    })
      // .pipe(
      //   flatMap(projs => {
      //     if (
      //       !projs || projs.length === 0) {
      //       // NB: forkJoin([]) will complete immediately
      //       // so return empty observable instead
      //       return of([] as Project[]);
      //     }
      //     const observables: Array<Observable<Project>> = [];
      //     projs.forEach(proj => {
      //       // now get the rest of the data for each project
      //       observables.push(this._getExtraAppData(new Project(proj), params || {}));
      //     });
      //     return forkJoin(observables);
      //   })
      // )
      .catch(error => this.api.handleError(error));
  }

  getById(projId: string, params: GetParameters = null): Observable<Project> {
    return this.api.getProject(projId)
      .map(projects => {
        // return the first (only) project
        return projects.length > 0 ? new Project(projects[0]) : null;
      })
      // .mergeMap(project => {
      //   if (!project) { return of(null as Project); }
      //   const promises: Array<Promise<any>> = [];

      //   // Get the current comment period
      //   promises.push(this.commentPeriodService.getAllByProjectId(project._id)
      //     .toPromise()
      //     .then(periods => {
      //       project.commentPeriods = periods;
      //     })
      //   );

      //   return Promise.all(promises).then(() => {
      //     this.project = project;
      //     return this.project;
      //   });
      // })
      .catch(error => this.api.handleError(error));
  }

  // get a specific project by its object id
  // getById(projId: string, params: GetParameters = null): Observable<Project> {
  //   // first get just the project
  //   return this.api.getProject(projId)
  //     .pipe(
  //       flatMap(projs => {
  //         if (!projs || projs.length === 0) {
  //           return of(null as Project);
  //         }
  //         // now get the rest of the data for this project
  //         return this._getExtraAppData(new Project(projs[0]), params || {});
  //       })
  //     )
  //     .catch(error => this.api.handleError(error));
  // }

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
  // add(item: any): Observable<Project> {
  //   const proj = new Project(item);

  //   // boilerplate for new project
  //   proj.agency = 'Crown Land Allocation';
  //   proj.name = item.cl_file && item.cl_file.toString();

  //   // id must not exist on POST
  //   delete proj._id;

  //   // don't send attached data (features, documents, etc)
  //   delete proj.features;
  //   delete proj.documents;
  //   delete proj.currentPeriods;
  //   delete proj.decision;

  //   // replace newlines with \\n (JSON format)
  //   if (proj.description) {
  //     proj.description = proj.description.replace(/\n/g, '\\n');
  //   }
  //   if (proj.legalDescription) {
  //     proj.legalDescription = proj.legalDescription.replace(/\n/g, '\\n');
  //   }

  //   return this.api.addProject(proj)
  //     .catch(error => this.api.handleError(error));
  // }

  // update existing project
  // save(orig: Project): Observable<Project> {
  //   // make a (deep) copy of the passed-in project so we don't change it
  //   const proj = _.cloneDeep(orig);

  //   // don't send attached data (features, documents, etc)
  //   delete proj.features;
  //   delete proj.documents;
  //   delete proj.currentPeriods;
  //   delete proj.decision;

  //   // replace newlines with \\n (JSON format)
  //   if (proj.description) {
  //     proj.description = proj.description.replace(/\n/g, '\\n');
  //   }
  //   if (proj.legalDescription) {
  //     proj.legalDescription = proj.legalDescription.replace(/\n/g, '\\n');
  //   }

  //   return this.api.saveProject(proj)
  //     .catch(error => this.api.handleError(error));
  // }

  // delete(proj: Project): Observable<Project> {
  //   return this.api.deleteProject(proj)
  //     .catch(error => this.api.handleError(error));
  // }

  // publish(proj: Project): Observable<Project> {
  //   return this.api.publishProject(proj)
  //     .catch(error => this.api.handleError(error));
  // }

  // unPublish(proj: Project): Observable<Project> {
  //   return this.api.unPublishProject(proj)
  //     .catch(error => this.api.handleError(error));
  // }

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
