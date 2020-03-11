import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEditContactComponent } from './contacts/add-edit-contact/add-edit-contact.component';
import { LoginComponent } from './login/login.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { SearchComponent } from './search/search.component';
import { AdministrationComponent } from './administration/administration.component';
import { TopicsComponent } from './administration/topics/topics.component';
import { MapComponent } from './map/map.component';
import { MetricsComponent } from './metrics/metrics.component';
import { ContactsComponent } from './contacts/contacts.component';
import { ActivityComponent } from './activity/activity.component';
import { SearchHelpComponent } from './search-help/search-help.component';

import { ContactsResolver } from './contacts/contacts-resolver.service';
import { ActivityComponentResolver } from './activity/activity-component-resolver.services';

import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';
import { AddEditActivityComponent } from './activity/add-edit-activity/add-edit-activity.component';
import { TopicsResolver } from './administration/topics/topics-resolver.services';
import { PinsGlobalComponentResolver } from './project/pins-list/pins-global-resolver.service';
import { ProjectGroupResolver } from './project/project-groups/project-group-resolver.services';
import { ProjectContactsGroupResolver } from './project/project-groups/project-contact-group-resolver.services';
import { EditContactResolver } from './contacts/add-edit-contact/edit-contact-resolver.services';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationsResolver } from './organizations/organizations-resolver.service';
import { AddEditOrganizationComponent } from './organizations/add-edit-organization/add-edit-organization.component';
import { EditOrganizationResolver } from './organizations/add-edit-organization/edit-organization-resolver.services';
import { LinkOrganizationComponent } from './shared/components/link-organization/link-organization.component';
import { LinkOrganizationResolver } from './shared/components/link-organization/link-organization-resolver.services';
import { ProjectNotificationsComponent } from './project-notifications/project-notifications.component';
import { ProjectNotificationsResolver } from './project-notifications/project-notifications-resolver.service';
import { AddEditProjectNotificationComponent } from './project-notifications/add-edit-project-notification/add-edit-project-notification.component';
import { ProjectNotificationDetailComponent } from './project-notification/detail/project-notification-detail.component';
import { ProjectNotificationResolver } from './project-notification/project-notification-resolver.service';
import { ProjectNotificationDocumentsResolver } from './project-notification/documents/project-notification-documents-resolver.service';
import { ProjectNotificationDocumentsComponent } from './project-notification/documents/project-notification-documents.component';

import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'administration',
    component: AdministrationComponent,
    canActivate: [AuthGuard],
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
    path: 'administration/topics',
    component: TopicsComponent,
    canActivate: [AuthGuard],
    resolve: {
      topics: TopicsResolver
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
    TopicsResolver,
    ProjectNotificationDocumentsResolver,
    AuthGuard,
  ]
})

export class AppRoutingModule { }
