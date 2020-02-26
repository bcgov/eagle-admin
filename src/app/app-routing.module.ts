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
import { NotificationProjectsComponent } from './notification-projects/notification-projects.component';
import { NotificationProjectsResolver } from './notification-projects/notification-projects-resolver.service';
import { AddEditNotificationProjectComponent } from './notification-projects/add-edit-notification-project/add-edit-notification-project.component';
import { NotificationProjectComponent } from './notification-project/notification-project.component';
import { NotificationProjectResolver } from './notification-project/notification-project-resolver.service';
import { NotificationProjectDocumentsResolver } from './notification-project/notification-project-documents-resolver.service';

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
    path: 'notification-projects',
    component: NotificationProjectsComponent,
    canActivate: [AuthGuard],
    resolve: {
      notificationProjects: NotificationProjectsResolver
    }
  },
  {
    path: 'np/:notificationProjectId',
    resolve: {
      notificationProject: NotificationProjectResolver,
      documents: NotificationProjectDocumentsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'notification-project-details',
        pathMatch: 'full',
      },
      {
        path: 'notification-project-details',
        component: NotificationProjectComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'edit',
        component: AddEditNotificationProjectComponent,
        canActivate: [AuthGuard],
      }
    ],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'notification-projects/add',
    component: AddEditNotificationProjectComponent,
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
    NotificationProjectsResolver,
    NotificationProjectResolver,
    OrganizationsResolver,
    PinsGlobalComponentResolver,
    ProjectContactsGroupResolver,
    ProjectGroupResolver,
    TopicsResolver,
    NotificationProjectDocumentsResolver,
    AuthGuard,
  ]
})

export class AppRoutingModule { }
