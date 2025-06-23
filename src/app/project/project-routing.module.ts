import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { AddCommentComponent } from '../comment-period/add-comment/add-comment.component';
import { AddDocumentComponent } from '../comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddEditCommentPeriodComponent } from '../comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddLabelComponent } from './project-documents/add-label/add-label.component';
import { CommentPeriodComponent } from '../comment-period/comment-period.component';
import { CommentPeriodsComponent } from '../comment-periods/comment-periods.component';
import { DocumentDetailComponent } from './project-documents/detail/detail.component';
import { DocumentApplicationSortComponent } from './project-documents/application-sort/application-sort.component';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectComponent } from './project.component';
import { ProjectGroupsComponent } from './project-groups/project-groups.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectArchivedDetailComponent } from './project-archived-detail/project-archived-detail.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { UploadComponent } from './project-documents/upload/upload.component';
import { PinsListComponent } from './pins-list/pins-list.component';
import { GroupContactComponent } from './project-groups/group-contact/group-contact.component';
import { GroupContactSelectComponent } from './project-groups/group-contact/group-contact-select/group-contact-select.component';
import { ReviewCommentComponent } from '../comment-period/review-comment/review-comment.component';
import { AddEditProjectComponent } from '../projects/add-edit-project/add-edit-project.component';
import { ContactSelectComponent } from '../shared/components/contact-select/contact-select.component';
import { ExtensionComponent } from '../shared/components/extension/extension.component';
import { LinkOrganizationComponent } from '../shared/components/link-organization/link-organization.component';

// Resolvers
import { AddDocumentsResolver } from '../comment-periods/add-edit-comment-period/add-documents/add-documents-resolver.services';
import { CommentPeriodResolver } from '../comment-period/comment-period-resolver.service';
import { CommentPeriodsResolver } from '../comment-periods/comment-periods-resolver.services';
import { DocumentDetailResolver } from './project-documents/detail/document-detail-resolver.service';
import { DocumentsResolver } from './project-documents/project-document-resolver.services';
import { ProjectResolver } from './project-resolver.service';
import { ReviewCommentResolver } from '../comment-period/review-comment/review-comment-resolver.service';
import { ProjectUpdatesResolver } from './project-updates/project-updates-resolver.services';
import { PinsComponentResolver } from './pins-list/pins-component-resolver.services';
import { ProjectContactsResolver } from './project-groups/project-groups-resolver.services';
import { ApplicationSortResolver } from './project-documents/application-sort/application-sort-resolver.service';
import { PinsGlobalComponentResolver } from './pins-list/pins-global-resolver.service';
import { ProjectGroupResolver } from './project-groups/project-group-resolver.services';
import { ProjectContactsGroupResolver } from './project-groups/project-contact-group-resolver.services';
import { FullProjectResolver } from './full-project-resolver.service';
import { ContactsResolver } from '../contacts/contacts-resolver.service';
import { LinkOrganizationResolver } from '../shared/components/link-organization/link-organization-resolver.services';

// Routes
import { ProjectsRoutes } from '../projects/projects-routes';

const routes: Routes = [
  {
    path: 'p/:projId',
    component: ProjectComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      project: ProjectResolver,
    },
    children: [
      {
        path: '',
        redirectTo: 'project-details',
        pathMatch: 'full'
      },
      {
        path: 'edit/add-extension',
        component: ExtensionComponent
      },
      {
        path: 'edit/add-suspension',
        component: ExtensionComponent
      },
      {
        path: 'edit/edit-extension',
        component: ExtensionComponent
      },
      {
        path: 'edit/edit-suspension',
        component: ExtensionComponent
      },
      {
        path: 'edit/:formTab/link-org',
        component: LinkOrganizationComponent,
        resolve: {
          organizations: LinkOrganizationResolver
        }
      },
      {
        path: 'edit/:formTab/link-contact',
        component: ContactSelectComponent,
        resolve: {
          contacts: ContactsResolver
        }
      },
      {
        path: 'edit',
        component: AddEditProjectComponent,
        children: ProjectsRoutes,
        resolve: {
          fullProject: FullProjectResolver
        }
      },
      {
        path: 'project-details',
        component: ProjectDetailComponent,
        resolve: {
          fullProject: FullProjectResolver
        },
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'project-archived-detail',
        component: ProjectArchivedDetailComponent,
        resolve: {
          fullProject: FullProjectResolver
        }
      },
      {
        path: 'project-documents',
        component: ProjectDocumentsComponent,
        resolve: {
          documents: DocumentsResolver,
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
        path: 'project-documents/application-sort',
        component: DocumentApplicationSortComponent,
        resolve: {
          documents: ApplicationSortResolver
        }
      },
      {
        path: 'project-documents/upload/add-label',
        component: AddLabelComponent,
      },
      {
        path: 'project-updates',
        component: ProjectUpdatesComponent,
        resolve: {
          documents: ProjectUpdatesResolver
        }
      },
      {
        path: 'project-groups',
        component: ProjectGroupsComponent,
        resolve: {
          contacts: ProjectContactsResolver
        }
      },
      {
        path: 'project-groups/g/:groupId/members',
        component: GroupContactComponent,
        resolve: {
          group: ProjectGroupResolver,
          users: ProjectContactsGroupResolver
        }
      },
      {
        path: 'project-groups/g/:groupId/members/select',
        component: GroupContactSelectComponent,
        resolve: {
          contacts: ContactsResolver
        }
      },
      {
        path: 'project-pins',
        component: PinsListComponent,
        resolve: {
          contacts: PinsComponentResolver
        }
      },
      {
        path: 'project-pins/select',
        component: LinkOrganizationComponent,
        resolve: {
          organizations: PinsGlobalComponentResolver
        }
      },
      {
        path: 'project-pins/link-org',
        component: LinkOrganizationComponent,
        resolve: {
          organizations: PinsGlobalComponentResolver
        }
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
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})
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
    ProjectResolver,
    FullProjectResolver,
    ReviewCommentResolver,
    PinsComponentResolver,
    ProjectContactsResolver,
    ApplicationSortResolver,
    LinkOrganizationResolver
  ]
})

export class ProjectRoutingModule { }
