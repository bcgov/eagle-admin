import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectNotificationComponent } from './project-notification.component';
import { ProjectNotificationDocumentsComponent } from './documents/project-notification-documents.component';

import { ProjectNotificationResolver } from './project-notification-resolver.service';
import { ProjectNotificationDocumentsResolver } from './documents/project-notification-documents-resolver.service';
import { ListResolver } from 'app/shared/resolvers/list-resolver.service';

const routes: Routes = [
  {
    path: 'pn/:notificationProjectId',
    component: ProjectNotificationComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      project: ProjectNotificationResolver,
      list: ListResolver,
    },
    children: [
      {
        path: 'project-notification-documents',
        component: ProjectNotificationDocumentsComponent,
        resolve: {
          documents: ProjectNotificationDocumentsResolver,
        }
      }
    ]
  }
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
