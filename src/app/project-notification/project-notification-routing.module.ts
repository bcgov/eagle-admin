import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectNotificationDetailComponent } from '../project-notification/detail/project-notification-detail.component';
import { ProjectNotificationResolver } from '../project-notification/project-notification-resolver.service';
import { ProjectNotificationDocumentsComponent } from './documents/project-notification-documents.component';
import { ProjectNotificationDocumentsResolver } from '../project-notification/documents/project-notification-documents-resolver.service';
import { ProjectNotificationComponent } from './project-notification.component';
import { AddEditProjectNotificationComponent } from '../project-notifications/add-edit-project-notification/add-edit-project-notification.component';
import { UploadComponent } from './documents/upload/upload.component';

import { AuthGuard } from '../services/auth-guard.service';

const routes: Routes = [
  {
    path: 'pn/:notificationProjectId',
    component: ProjectNotificationComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      notificationProject: ProjectNotificationResolver,
      documents: ProjectNotificationDocumentsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'details',
        pathMatch: 'full',
      },
      {
        path: 'details',
        component: ProjectNotificationDetailComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'edit',
        component: AddEditProjectNotificationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'project-notification-documents',
        component: ProjectNotificationDocumentsComponent,
        resolve: {
          documents: ProjectNotificationDocumentsResolver,
        }
      },
      {
        path: 'project-notification-documents/upload',
        component: UploadComponent
      }
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ProjectNotificationComponent,
    ProjectNotificationDocumentsComponent,
    ProjectNotificationResolver,
    ProjectNotificationDocumentsResolver
  ]
})

export class ProjectNotificationRoutingModule { }
