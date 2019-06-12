import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddCommentComponent } from './comment-period/add-comment/add-comment.component';
import { AddDocumentComponent } from './comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddEditCommentPeriodComponent } from './comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddEditProjectComponent } from 'app/projects/add-edit-project/add-edit-project.component';
import { AddLabelComponent } from './project-documents/add-label/add-label.component';
import { AddVcComponent } from './valued-components/add-vc/add-vc.component';
import { CommentPeriodComponent } from './comment-period/comment-period.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { CommentPeriodsResolver } from './comment-periods/comment-periods-resolver.services';
import { ComplianceComponent } from './compliance/compliance.component';
import { DocumentDetailComponent } from './project-documents/detail/detail.component';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectComponent } from './project.component';
import { ProjectContactsComponent } from './project-contacts/project-contacts.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ReviewCommentComponent } from './comment-period/review-comment/review-comment.component';
import { UploadComponent } from './project-documents/upload/upload.component';
import { ValuedComponentsComponent } from './valued-components/valued-components.component';

import { AddDocumentsResolver } from './comment-periods/add-edit-comment-period/add-documents/add-documents-resolver.services';
import { CommentPeriodResolver } from './comment-period/comment-period-resolver.service';
import { DocumentDetailResolver } from './project-documents/detail/document-detail-resolver.service';
import { DocumentsResolver } from './project-documents/project-document-resolver.services';
import { ProjectResolver } from './project-resolver.service';
import { ReviewCommentResolver } from './comment-period/review-comment/review-comment-resolver.service';
import { TopicResolver } from './valued-components/add-vc/topic-resolver.services';
import { ValuedComponentsResolver } from './valued-components/valued-components-resolver.services';
import { ProjectUpdatesResolver } from './project-updates/project-updates-resolver.services';

const routes: Routes = [
  {
    path: 'p/:projId',
    component: ProjectComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      project: ProjectResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'project-details',
        pathMatch: 'full'
      },
      {
        path: 'edit',
        component: AddEditProjectComponent
      },
      {
        path: 'project-details',
        component: ProjectDetailComponent,
      },
      {
        path: 'project-documents',
        component: ProjectDocumentsComponent,
        resolve: {
          documents: DocumentsResolver
        }
      },
      {
        path: 'project-documents/upload',
        component: UploadComponent,
      },
      {
        path: 'project-documents/edit',
        component: DocumentEditComponent,
      },
      {
        path: 'project-documents/edit/add-label',
        component: AddLabelComponent,
      },
      {
        path: 'project-documents/detail/:docId',
        component: DocumentDetailComponent,
        resolve: {
          document: DocumentDetailResolver
        }
      },
      {
        path: 'project-documents/upload/add-label',
        component: AddLabelComponent,
      },
      {
        path: 'compliance',
        component: ComplianceComponent,
      },
      {
        path: 'valued-components',
        component: ValuedComponentsComponent,
        resolve: {
          valuedComponents: ValuedComponentsResolver
        }
      },
      {
        path: 'valued-components/add',
        component: AddVcComponent,
        resolve: {
          topics: TopicResolver
        }
      },
      {
        path: 'project-updates',
        component: ProjectUpdatesComponent,
        resolve: {
          documents: ProjectUpdatesResolver
        }
      },
      {
        path: 'project-contracts',
        component: ProjectContactsComponent,
      },
      {
        path: 'comment-periods/add/add-documents',
        component: AddDocumentComponent,
        resolve: {
          documents: AddDocumentsResolver
        }
      },
      {
        path: 'comment-periods/add',
        component: AddEditCommentPeriodComponent,
      },
      {
        path: 'comment-periods',
        component: CommentPeriodsComponent,
        resolve: {
          commentPeriods: CommentPeriodsResolver
        }
      },
      {
        path: 'cp/:commentPeriodId',
        resolve: {
          commentPeriod: CommentPeriodResolver,
        },
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
      },
      {
        path: 'milestones',
        component: MilestonesComponent,
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AddDocumentsResolver,
    CommentPeriodResolver,
    CommentPeriodsResolver,
    DocumentDetailResolver,
    DocumentsResolver,
    ProjectUpdatesResolver,
    DocumentDetailResolver,
    TopicResolver,
    ProjectResolver,
    ReviewCommentResolver,
    ValuedComponentsResolver
  ]
})

export class ProjectRoutingModule { }
