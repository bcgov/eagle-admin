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

import { ContactsResolverService } from './contacts/contacts-resolver.service';
import { ActivityComponentResolver } from './activity/activity-component-resolver.services';

import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';
import { AddEditActivityComponent } from './activity/add-edit-activity/add-edit-activity.component';
import { TopicsResolver } from './administration/topics/topics-resolver.services';
import { PinsGlobalComponentResolver } from './project/pins-list/pins-global-resolver.service';
import { ProjectGroupResolver } from './project/project-groups/project-group-resolver.services';
import { ProjectContactsGroupResolverService } from './project/project-groups/project-contact-group-resolver.services';
import { LinkOrganizationResolver } from './contacts/link-organization/link-organization-resolver.services';
import { LinkOrganizationComponent } from './contacts/link-organization/link-organization.component';
import { EditContactResolver } from './contacts/add-edit-contact/edit-contact-resolver.services';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'administration',
    component: AdministrationComponent
  },
  {
    path: 'administration/topics',
    component: TopicsComponent,
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
    component: SearchComponent
  },
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: 'metrics',
    component: MetricsComponent
  },
  {
    path: 'c/:contactId/edit/link-org',
    component: LinkOrganizationComponent,
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'c/:contactId/edit',
    component: AddEditContactComponent,
    resolve: {
      contact: EditContactResolver
    }
  },
  {
    path: 'contacts/add/link-org',
    component: LinkOrganizationComponent,
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'contacts/add',
    component: AddEditContactComponent,
  },
  {
    path: 'contacts',
    component: ContactsComponent,
    resolve: {
      users: ContactsResolverService
    }
  },
  {
    path: 'activity',
    component: ActivityComponent,
    resolve: {
      activities: ActivityComponentResolver
    },
  },
  {
    path: 'activity/:activityId/edit',
    component: AddEditActivityComponent,
    resolve: {
      activity: ActivityComponentResolver
    }
  },
  {
    path: 'activity/add',
    component: AddEditActivityComponent
  },
  {
    path: 'search-help',
    component: SearchHelpComponent
  },
  {
    // default route
    path: '',
    component: SearchComponent
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
    CanDeactivateGuard,
    ContactsResolverService,
    EditContactResolver,
    ProjectGroupResolver,
    ProjectContactsGroupResolverService,
    PinsGlobalComponentResolver,
    ActivityComponentResolver,
    LinkOrganizationResolver,
    TopicsResolver
  ]
})

export class AppRoutingModule { }
