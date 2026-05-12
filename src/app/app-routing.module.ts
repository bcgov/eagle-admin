// Angular Modules
import { Routes } from '@angular/router';

// Resolvers
import { projectResolver } from './resolvers/project.resolver';
import { projectNotificationResolver } from './resolvers/project-notification.resolver';
import { commentPeriodResolver } from './resolvers/comment-period.resolver';
import { commentResolver } from './resolvers/comment.resolver';
import { documentResolver } from './resolvers/document.resolver';
import { fullProjectResolver } from './resolvers/full-project.resolver';
import { pinsResolver } from './resolvers/pins.resolver';

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
// (all resolvers removed)

// Guards
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
  // Authentication & Authorization
  { path: 'login', component: LoginComponent },
  { path: 'not-authorized', component: NotAuthorizedComponent },

  // Activity
  {
    path: 'activity',
    component: ActivityComponent,
    canActivate: [AuthGuard],
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
  },

  // Contacts
  {
    path: 'c/:contactId/edit',
    component: AddEditContactComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'c/:contactId/edit/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'contacts',
    component: ContactsComponent,
    canActivate: [AuthGuard],
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
  },
  {
    path: 'o/:orgId/edit/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'orgs',
    component: OrganizationsComponent,
    canActivate: [AuthGuard],
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
  },

  // Project Notifications
  {
    path: 'pn/:notificationProjectId',
    component: ProjectNotificationComponent,
    resolve: { project: projectNotificationResolver },
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
        canActivate: [AuthGuard],
      },
      {
        path: 'comment-periods/add',
        component: AddEditCommentPeriodComponent,
      },
      {
        path: 'comment-periods/add/add-documents',
        component: AddDocumentComponent,
      },
      {
        path: 'cp/:commentPeriodId',
        canActivate: [AuthGuard],
        resolve: { commentPeriod: commentPeriodResolver },
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
          },
          {
            path: 'edit',
            component: AddEditCommentPeriodComponent
          },
          {
            path: 'c/:commentId',
            resolve: { comment: commentResolver },
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
    path: 'project-notifications',
    component: ProjectNotificationsComponent,
    canActivate: [AuthGuard],
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
    resolve: { project: projectResolver },
    runGuardsAndResolvers: 'always',
    children: [
      { path: '', redirectTo: 'project-details', pathMatch: 'full' },

      // Project Edit & Extensions
      {
        path: 'edit',
        component: AddEditProjectComponent,
        resolve: { fullProject: fullProjectResolver },
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
      },
      {
        path: 'edit/:formTab/link-org',
        component: LinkOrganizationComponent,
      },

      // Project Details & Archived
      {
        path: 'project-archived-detail',
        component: ProjectArchivedDetailComponent,
        resolve: { fullProject: fullProjectResolver },
      },
      {
        path: 'project-details',
        component: ProjectDetailComponent,
        resolve: { fullProject: fullProjectResolver },
        runGuardsAndResolvers: 'always'
      },

      // Project Documents
      {
        path: 'project-documents',
        component: ProjectDocumentsComponent,
      },
      {
        path: 'project-documents/application-sort',
        component: DocumentApplicationSortComponent,
      },
      {
        path: 'project-documents/detail/:docId',
        component: DocumentDetailComponent,
        resolve: { resolvedDocument: documentResolver },
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
      },
      {
        path: 'project-groups/g/:groupId/members',
        component: GroupContactComponent,
      },
      {
        path: 'project-groups/g/:groupId/members/select',
        component: GroupContactSelectComponent,
      },

      // Project Pins
      {
        path: 'project-pins',
        component: PinsListComponent,
        resolve: { contacts: pinsResolver },
      },
      {
        path: 'project-pins/link-org',
        component: LinkOrganizationComponent,
        data: { companyTypeFilter: 'Indigenous Group' }
      },
      {
        path: 'project-pins/select',
        component: LinkOrganizationComponent,
        data: { companyTypeFilter: 'Indigenous Group' }
      },

      // Project Updates
      {
        path: 'project-updates',
        component: ProjectUpdatesComponent,
      },

      // Comment Periods
      {
        path: 'comment-periods',
        component: CommentPeriodsComponent,
      },
      {
        path: 'comment-periods/add',
        component: AddEditCommentPeriodComponent
      },
      {
        path: 'comment-periods/add/add-documents',
        component: AddDocumentComponent,
      },
      {
        path: 'cp/:commentPeriodId',
        resolve: { commentPeriod: commentPeriodResolver },
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
          },
          {
            path: 'c/:commentId',
            resolve: { comment: commentResolver },
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
  },
  {
    path: 'projects/add/:formTab/link-org',
    component: LinkOrganizationComponent,
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


