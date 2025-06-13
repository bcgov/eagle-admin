import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectNotificationDetailComponent } from '../project-notification/detail/project-notification-detail.component';
import { ProjectNotificationResolver } from '../project-notification/project-notification-resolver.service';
import { ProjectNotificationDocumentsComponent } from './documents/project-notification-documents.component';
import { ProjectNotificationDocumentsResolver } from '../project-notification/documents/project-notification-documents-resolver.service';
import { ProjectNotificationComponent } from './project-notification.component';
import { AddEditProjectNotificationComponent } from '../project-notifications/add-edit-project-notification/add-edit-project-notification.component';
import { UploadComponent } from './documents/upload/upload.component';
import { AddCommentComponent } from '../comment-period/add-comment/add-comment.component';
import { AddDocumentComponent } from '../comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddEditCommentPeriodComponent } from '../comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { CommentPeriodComponent } from '../comment-period/comment-period.component';
import { CommentPeriodsComponent } from '../comment-periods/comment-periods.component';
import { CommentPeriodsResolver } from '../comment-periods/comment-periods-resolver.services';
import { ReviewCommentComponent } from '../comment-period/review-comment/review-comment.component';
import { ReviewCommentResolver } from '../comment-period/review-comment/review-comment-resolver.service';
import { AddDocumentsResolver } from '../comment-periods/add-edit-comment-period/add-documents/add-documents-resolver.services';
import { CommentPeriodResolver } from '../comment-period/comment-period-resolver.service';

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
        canActivate: [AuthGuard],
      },
      {
        path: 'project-notification-documents/upload',
        component: UploadComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'comment-periods',
        component: CommentPeriodsComponent,
        resolve: {
          commentPeriods: CommentPeriodsResolver
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'comment-periods/add',
        component: AddEditCommentPeriodComponent,
      },
      {
        path: 'comment-periods/add/add-documents',
        component: AddDocumentComponent,
        resolve: {
          documents: AddDocumentsResolver
        }
      },
      {
        path: 'cp/:commentPeriodId',
        resolve: {
          commentPeriod: CommentPeriodResolver,
        },
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: 'comment-period-details',
            pathMatch: 'full'
          },
          {
            path: 'add-comment',
            component: AddCommentComponent
          },
          {
            path: 'comment-period-details',
            component: CommentPeriodComponent
          },
          {
            path: 'edit/add-documents',
            component: AddDocumentComponent,
            resolve: {
              documents: AddDocumentsResolver
            }
          },
          {
            path: 'edit',
            component: AddEditCommentPeriodComponent
          },
          {
            path: 'c/:commentId',
            resolve: {
              comment: ReviewCommentResolver
            },
            children: [
              {
                path: '',
                redirectTo: 'comment-details',
                pathMatch: 'full'
              },
              {
                path: 'comment-details',
                component: ReviewCommentComponent
              }
            ]
          }
        ]
      }
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ProjectNotificationComponent,
    ProjectNotificationDocumentsComponent,
    ProjectNotificationResolver,
    ProjectNotificationDocumentsResolver,
    AddDocumentsResolver,
    CommentPeriodResolver,
    CommentPeriodsResolver,
    ReviewCommentResolver
  ]
})

export class ProjectNotificationRoutingModule { }
