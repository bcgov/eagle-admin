import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ActivityComponent } from './activity/activity.component';
import { AddEditActivityComponent } from './activity/add-edit-activity/add-edit-activity.component';
import { AddEditContactComponent } from './contacts/add-edit-contact/add-edit-contact.component';
import { AddEditOrganizationComponent } from './organizations/add-edit-organization/add-edit-organization.component';
import { AddEditProjectNotificationComponent } from './project-notifications/add-edit-project-notification/add-edit-project-notification.component';
import { ContactsComponent } from './contacts/contacts.component';
import { LinkOrganizationComponent } from './shared/components/link-organization/link-organization.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { MetricsComponent } from './metrics/metrics.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { ProjectNotificationDetailComponent } from './project-notification/detail/project-notification-detail.component';
import { ProjectNotificationDocumentsComponent } from './project-notification/documents/project-notification-documents.component';
import { ProjectNotificationsComponent } from './project-notifications/project-notifications.component';
import { SearchComponent } from './search/search.component';
import { SearchHelpComponent } from './search-help/search-help.component';

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

// Guards
import { AuthGuard } from './services/auth-guard.service';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'o/:orgId/edit',
    component: AddEditOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: {
      organization: EditOrganizationResolver
    }
  },
  {
    path: 'o/:orgId/edit/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'orgs',
    component: OrganizationsComponent,
    canActivate: [AuthGuard],
    resolve: {
      orgs: OrganizationsResolver
    }
  },
  {
    path: 'orgs/add',
    component: AddEditOrganizationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'orgs/add/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'not-authorized',
    component: NotAuthorizedComponent
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'map',
    component: MapComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'metrics',
    component: MetricsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project-notifications',
    component: ProjectNotificationsComponent,
    canActivate: [AuthGuard],
    resolve: {
      notificationProjects: ProjectNotificationsResolver
    }
  },
  {
    path: 'pn/:notificationProjectId',
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
      }
    ],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'project-notifications/add',
    component: AddEditProjectNotificationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'c/:contactId/edit/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'c/:contactId/edit',
    component: AddEditContactComponent,
    canActivate: [AuthGuard],
    resolve: {
      contact: EditContactResolver
    }
  },
  {
    path: 'contacts/add/link-org',
    component: LinkOrganizationComponent,
    canActivate: [AuthGuard],
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'contacts/add',
    component: AddEditContactComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'contacts',
    component: ContactsComponent,
    canActivate: [AuthGuard],
    resolve: {
      users: ContactsResolver
    }
  },
  {
    path: 'activity',
    component: ActivityComponent,
    canActivate: [AuthGuard],
    resolve: {
      activities: ActivityComponentResolver
    },
  },
  {
    path: 'activity/:activityId/edit',
    component: AddEditActivityComponent,
    canActivate: [AuthGuard],
    resolve: {
      activity: ActivityComponentResolver
    }
  },
  {
    path: 'activity/add',
    component: AddEditActivityComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'search-help',
    component: SearchHelpComponent,
    canActivate: [AuthGuard],
  },
  {
    // default route
    path: '',
    component: SearchComponent,
    canActivate: [AuthGuard],
  },
  {
    // wildcard route
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
    CanDeactivateGuard,
    ContactsResolver,
    EditContactResolver,
    EditOrganizationResolver,
    LinkOrganizationResolver,
    ProjectNotificationsResolver,
    ProjectNotificationResolver,
    OrganizationsResolver,
    PinsGlobalComponentResolver,
    ProjectContactsGroupResolver,
    ProjectGroupResolver,
    ProjectNotificationDocumentsResolver,
    AuthGuard,
  ]
})

export class AppRoutingModule { }
