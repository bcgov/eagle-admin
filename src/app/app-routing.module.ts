// Angular Modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ActivityComponent } from './activity/activity.component';
import { AddCommentComponent } from './comment-period/add-comment/add-comment.component';
import { AddDocumentComponent } from './comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddEditActivityComponent } from './activity/add-edit-activity/add-edit-activity.component';
import { AddEditCommentPeriodComponent } from './comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddEditContactComponent } from './contacts/add-edit-contact/add-edit-contact.component';
import { AddEditOrganizationComponent } from './organizations/add-edit-organization/add-edit-organization.component';
import { AddEditProjectComponent } from './projects/add-edit-project/add-edit-project.component';
import { AddEditProjectNotificationComponent } from './project-notifications/add-edit-project-notification/add-edit-project-notification.component';
import { AddLabelComponent } from './project/project-documents/add-label/add-label.component';
import { CommentPeriodComponent } from './comment-period/comment-period.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { ContactSelectComponent } from './shared/components/contact-select/contact-select.component';
import { ContactsComponent } from './contacts/contacts.component';
import { DocumentApplicationSortComponent } from './project/project-documents/application-sort/application-sort.component';
import { DocumentDetailComponent } from './project/project-documents/detail/detail.component';
import { DocumentEditComponent } from './project/project-documents/document-edit/document-edit.component';
import { ExtensionComponent } from './shared/components/extension/extension.component';
import { FormTab2002Component } from './projects/add-edit-project/form-tab-2002/form-tab-2002.component';
import { FormTab2018Component } from './projects/add-edit-project/form-tab-2018/form-tab-2018.component';
import { GroupContactComponent } from './project/project-groups/group-contact/group-contact.component';
import { GroupContactSelectComponent } from './project/project-groups/group-contact/group-contact-select/group-contact-select.component';
import { LinkOrganizationComponent } from './shared/components/link-organization/link-organization.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { MetricsComponent } from './metrics/metrics.component';
import { MilestonesComponent } from './project/milestones/milestones.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { PinsListComponent } from './project/pins-list/pins-list.component';
import { ProjectArchivedDetailComponent } from './project/project-archived-detail/project-archived-detail.component';
import { ProjectComponent } from './project/project.component';
import { ProjectDetailComponent } from './project/project-detail/project-detail.component';
import { ProjectDocumentsComponent } from './project/project-documents/project-documents.component';
import { ProjectGroupsComponent } from './project/project-groups/project-groups.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectNotificationComponent } from './project-notification/project-notification.component';
import { ProjectNotificationDetailComponent } from './project-notification/detail/project-notification-detail.component';
import { ProjectNotificationDocumentsComponent } from './project-notification/documents/project-notification-documents.component';
import { ProjectNotificationsComponent } from './project-notifications/project-notifications.component';
import { ProjectUpdatesComponent } from './project/project-updates/project-updates.component';
import { ReviewCommentComponent } from './comment-period/review-comment/review-comment.component';
import { SearchComponent } from './search/search.component';
import { SearchHelpComponent } from './search-help/search-help.component';
import { ProjectNotificationUploadComponent } from './project-notification/documents/project-notification-upload/project-notification-upload.component';
import { ProjectDocumentsUploadComponent } from './project/project-documents/project-documents-upload/project-documents-upload.component';

// Resolvers
import { ActivityComponentResolver } from './activity/activity-component-resolver.services';
import { ContactsResolver } from './contacts/contacts-resolver.service';
import { EditContactResolver } from './contacts/add-edit-contact/edit-contact-resolver.services';
import { EditOrganizationResolver } from './organizations/add-edit-organization/edit-organization-resolver.services';
import { LinkOrganizationResolver } from './shared/components/link-organization/link-organization-resolver.services';
import { OrganizationsResolver } from './organizations/organizations-resolver.service';
import { PinsGlobalComponentResolver } from './project/pins-list/pins-global-resolver.service';
import { ProjectContactsGroupResolver } from './project/project-groups/project-contact-group-resolver.services';
import { ProjectGroupResolver } from './project/project-groups/project-group-resolver.services';
import { ProjectNotificationDocumentsResolver } from './project-notification/documents/project-notification-documents-resolver.service';
import { ProjectNotificationResolver } from './project-notification/project-notification-resolver.service';
import { ProjectNotificationsResolver } from './project-notifications/project-notifications-resolver.service';
import { CommentPeriodResolver } from './comment-period/comment-period-resolver.service';
import { ReviewCommentResolver } from './comment-period/review-comment/review-comment-resolver.service';
import { AddDocumentsResolver } from './comment-periods/add-edit-comment-period/add-documents/add-documents-resolver.services';
import { CommentPeriodsResolver } from './comment-periods/comment-periods-resolver.services';
import { FullProjectResolver } from './project/full-project-resolver.service';
import { PinsComponentResolver } from './project/pins-list/pins-component-resolver.services';
import { ProjectContactsResolver } from './project/project-groups/project-groups-resolver.services';
import { ProjectListResolver } from './projects/project-list/project-list-resolver.services';
import { ProjectResolver } from './project/project-resolver.service';
import { ProjectUpdatesResolver } from './project/project-updates/project-updates-resolver.services';
import { ApplicationSortResolver } from './project/project-documents/application-sort/application-sort-resolver.service';
import { DocumentDetailResolver } from './project/project-documents/detail/document-detail-resolver.service';
import { DocumentsResolver } from './project/project-documents/project-document-resolver.services';

// Guards
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  // Authentication & Authorization
  { path: 'login', component: LoginComponent },
  { path: 'not-authorized', component: NotAuthorizedComponent },

  // Activity
  {
    path: 'activity',
    component: ActivityComponent,
    canActivate: [AuthGuard],
    resolve: { activities: ActivityComponentResolver }
  },
  {
    path: 'activity/add',
    component: AddEditActivityComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'activity/:activityId/edit',
    component: AddEditActivityComponent,
    canActivate: [AuthGuard],
    resolve: { activity: ActivityComponentResolver }
  },

  // Contacts
  {
    path: 'c/:contactId/edit',
    component: AddEditContactComponent,
    canActivate: [AuthGuard],
    resolve: { contact: EditContactResolver }
  },
  {
    path: 'c/:contactId/edit/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: { organizations: LinkOrganizationResolver }
  },
  {
    path: 'contacts',
    component: ContactsComponent,
    canActivate: [AuthGuard],
    resolve: { users: ContactsResolver }
  },
  {
    path: 'contacts/add',
    component: AddEditContactComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contacts/add/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: { organizations: LinkOrganizationResolver }
  },

  // Map & Metrics & Search
  {
    path: 'map',
    component: MapComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'metrics',
    component: MetricsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'search-help',
    component: SearchHelpComponent,
    canActivate: [AuthGuard]
  },

  // Organizations
  {
    path: 'o/:orgId/edit',
    component: AddEditOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: { organization: EditOrganizationResolver }
  },
  {
    path: 'o/:orgId/edit/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: { organizations: LinkOrganizationResolver }
  },
  {
    path: 'orgs',
    component: OrganizationsComponent,
    canActivate: [AuthGuard],
    resolve: { orgs: OrganizationsResolver }
  },
  {
    path: 'orgs/add',
    component: AddEditOrganizationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'orgs/add/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: { organizations: LinkOrganizationResolver }
  },

  // Project Notifications
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
        component: ProjectNotificationUploadComponent,
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
  {
    path: 'pn/:notificationProjectId',
    resolve: {
      notificationProject: ProjectNotificationResolver,
      documents: ProjectNotificationDocumentsResolver
    },
    children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      {
        path: 'details',
        component: ProjectNotificationDetailComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'edit',
        component: AddEditProjectNotificationComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'project-notification-documents',
        component: ProjectNotificationDocumentsComponent,
        canActivate: [AuthGuard]
      }
    ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'project-notifications',
    component: ProjectNotificationsComponent,
    canActivate: [AuthGuard],
    resolve: { notificationProjects: ProjectNotificationsResolver }
  },
  {
    path: 'project-notifications/add',
    component: AddEditProjectNotificationComponent,
    canActivate: [AuthGuard]
  },

  // Projects
  {
    path: 'p/:projId',
    component: ProjectComponent,
    runGuardsAndResolvers: 'always',
    resolve: { project: ProjectResolver },
    children: [
      { path: '', redirectTo: 'project-details', pathMatch: 'full' },

      // Project Edit & Extensions
      {
        path: 'edit',
        component: AddEditProjectComponent,
        children: [{
          path: '',
          redirectTo: 'form-2002',
          pathMatch: 'full',
        },
        {
          path: 'form-2002',
          component: FormTab2002Component
        },
        {
          path: 'form-2018',
          component: FormTab2018Component
        }],
        resolve: { fullProject: FullProjectResolver }
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
        path: 'edit/:formTab/link-contact',
        component: ContactSelectComponent,
        resolve: { contacts: ContactsResolver }
      },
      {
        path: 'edit/:formTab/link-org',
        component: LinkOrganizationComponent,
        resolve: { organizations: LinkOrganizationResolver }
      },

      // Project Details & Archived
      {
        path: 'project-archived-detail',
        component: ProjectArchivedDetailComponent,
        resolve: { fullProject: FullProjectResolver }
      },
      {
        path: 'project-details',
        component: ProjectDetailComponent,
        resolve: { fullProject: FullProjectResolver },
        runGuardsAndResolvers: 'always'
      },

      // Project Documents
      {
        path: 'project-documents',
        component: ProjectDocumentsComponent,
        resolve: { documents: DocumentsResolver }
      },
      {
        path: 'project-documents/application-sort',
        component: DocumentApplicationSortComponent,
        resolve: { documents: ApplicationSortResolver }
      },
      {
        path: 'project-documents/detail/:docId',
        component: DocumentDetailComponent,
        resolve: { document: DocumentDetailResolver }
      },
      {
        path: 'project-documents/edit',
        component: DocumentEditComponent
      },
      {
        path: 'project-documents/edit/add-label',
        component: AddLabelComponent
      },
      {
        path: 'project-documents/upload',
        component: ProjectDocumentsUploadComponent
      },
      {
        path: 'project-documents/upload/add-label',
        component: AddLabelComponent
      },

      // Project Groups
      {
        path: 'project-groups',
        component: ProjectGroupsComponent,
        resolve: { contacts: ProjectContactsResolver }
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
        resolve: { contacts: ContactsResolver }
      },

      // Project Pins
      {
        path: 'project-pins',
        component: PinsListComponent,
        resolve: { contacts: PinsComponentResolver }
      },
      {
        path: 'project-pins/link-org',
        component: LinkOrganizationComponent,
        resolve: { organizations: PinsGlobalComponentResolver }
      },
      {
        path: 'project-pins/select',
        component: LinkOrganizationComponent,
        resolve: { organizations: PinsGlobalComponentResolver }
      },

      // Project Updates
      {
        path: 'project-updates',
        component: ProjectUpdatesComponent,
        resolve: { documents: ProjectUpdatesResolver }
      },

      // Comment Periods
      {
        path: 'comment-periods',
        component: CommentPeriodsComponent,
        resolve: { commentPeriods: CommentPeriodsResolver }
      },
      {
        path: 'comment-periods/add',
        component: AddEditCommentPeriodComponent
      },
      {
        path: 'comment-periods/add/add-documents',
        component: AddDocumentComponent,
        resolve: { documents: AddDocumentsResolver }
      },
      {
        path: 'cp/:commentPeriodId',
        resolve: { commentPeriod: CommentPeriodResolver },
        children: [
          { path: '', redirectTo: 'comment-period-details', pathMatch: 'full' },
          {
            path: 'add-comment',
            component: AddCommentComponent
          },
          {
            path: 'comment-period-details',
            component: CommentPeriodComponent
          },
          {
            path: 'edit',
            component: AddEditCommentPeriodComponent
          },
          {
            path: 'edit/add-documents',
            component: AddDocumentComponent,
            resolve: { documents: AddDocumentsResolver }
          },
          {
            path: 'c/:commentId',
            resolve: { comment: ReviewCommentResolver },
            children: [
              { path: '', redirectTo: 'comment-details', pathMatch: 'full' },
              {
                path: 'comment-details',
                component: ReviewCommentComponent
              }
            ]
          }
        ]
      },

      // Milestones
      {
        path: 'milestones',
        component: MilestonesComponent
      }
    ]
  },
  {
    path: 'projects',
    component: ProjectListComponent,
    canActivate: [AuthGuard],
    resolve: {
      projects: ProjectListResolver
    }
  },
  {
    path: 'projects/add',
    component: AddEditProjectComponent,
    children: [{
      path: '',
      redirectTo: 'form-2002',
      pathMatch: 'full',
    },
    {
      path: 'form-2002',
      component: FormTab2002Component
    },
    {
      path: 'form-2018',
      component: FormTab2018Component
    }]
  },
  {
    path: 'projects/add/:formTab/link-contact',
    component: ContactSelectComponent,
    resolve: {
      contacts: ContactsResolver
    }
  },
  {
    path: 'projects/add/:formTab/link-org',
    component: LinkOrganizationComponent,
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },

  // Default & Wildcard
  {
    path: '',
    component: SearchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
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
    ActivityComponentResolver,
    AddDocumentsResolver,
    ApplicationSortResolver,
    CommentPeriodResolver,
    CommentPeriodsResolver,
    ContactsResolver,
    DocumentDetailResolver,
    DocumentsResolver,
    EditContactResolver,
    EditOrganizationResolver,
    FullProjectResolver,
    LinkOrganizationResolver,
    OrganizationsResolver,
    PinsComponentResolver,
    PinsGlobalComponentResolver,
    ProjectContactsGroupResolver,
    ProjectContactsResolver,
    ProjectGroupResolver,
    ProjectListResolver,
    ProjectNotificationDocumentsResolver,
    ProjectNotificationResolver,
    ProjectNotificationsResolver,
    ProjectResolver,
    ProjectUpdatesResolver,
    ReviewCommentResolver
  ]
})

export class AppRoutingModule { }
