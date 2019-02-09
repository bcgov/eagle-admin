import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';

import { of } from 'rxjs';

@Injectable()
export class ProjectsResolver implements Resolve<Project> {

  constructor(
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project> {
    const projId = route.paramMap.get('projId');

    if (projId === '0') {
      // create new project
      const project = new Project({
        purpose: route.queryParamMap.get('purpose'),
        subpurpose: route.queryParamMap.get('subpurpose'),
        type: route.queryParamMap.get('type'),
        subtype: route.queryParamMap.get('subtype'),
        status: route.queryParamMap.get('status'),
        tenureStage: route.queryParamMap.get('tenureStage'),
        location: route.queryParamMap.get('location'),
        businessUnit: route.queryParamMap.get('businessUnit'),
        cl_file: +route.queryParamMap.get('cl_file'), // NB: unary operator
        tantalisID: +route.queryParamMap.get('tantalisID'), // NB: unary operator
        client: route.queryParamMap.get('client'),
        legalDescription: route.queryParamMap.get('legalDescription')
      });

      // 7-digit CL File number for display
      // if (project.cl_file) {
      //   project['clFile'] = project.cl_file.toString().padStart(7, '0');
      // }

      // user-friendly project status
      // project.appStatus = this.projectService.getStatusString(this.projectService.getStatusCode(project.status));

      // derive region code
      // project.region = this.projectService.getRegionCode(project.businessUnit);

      return of(project);
    }

    // view/edit existing project
    return this.projectService.getById(projId, { getFeatures: true, getDocuments: true, getCurrentPeriod: true, getDecision: false });
  }

}
