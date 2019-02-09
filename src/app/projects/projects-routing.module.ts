import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';

import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectAddEditComponent } from './project-add-edit/project-add-edit.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { CommentPeriodsResolver } from './comment-periods/comment-periods-resolver.services';
import { ComplianceComponent } from './compliance/compliance.component';
import { ValuedComponentsComponent } from './valued-components/valued-components.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ProjectContactsComponent } from './project-contacts/project-contacts.component';
import { MilestonesComponent } from './milestones/milestones.component';

import { ProjectsResolver } from './projects-resolver.service';

const routes: Routes = [
  {
    path: 'projects',
    component: ProjectListComponent
  },
  {
    path: 'p/:projId',
    component: ProjectDetailComponent,
    resolve: {
      project: ProjectsResolver
    },
  },
  {
    path: 'p/:projId/compliance',
    component: ComplianceComponent,
  },
  {
    path: 'p/:projId/valued-components',
    component: ValuedComponentsComponent,
  },
  {
    path: 'p/:projId/project-updates',
    component: ProjectUpdatesComponent,
  },
  {
    path: 'p/:projId/project-contracts',
    component: ProjectContactsComponent,
  },
  {
    path: 'p/:projId/comment-periods',
    component: CommentPeriodsComponent,
    resolve: {
      commentPeriods: CommentPeriodsResolver
    },
  },
  {
    path: 'p/:projId/milestones',
    component: MilestonesComponent,
  },
  {
    path: 'p/:projId/edit',
    component: ProjectAddEditComponent,
    resolve: {
      project: ProjectsResolver
    },
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'comments/:projId',
    component: ReviewCommentsComponent,
    resolve: {
      project: ProjectsResolver
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ProjectsResolver,
    CommentPeriodsResolver
  ]
})

export class ProjectsRoutingModule { }
