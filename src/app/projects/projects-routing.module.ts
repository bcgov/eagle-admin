import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectListComponent } from './project-list/project-list.component';
import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';
import { ProjectListResolver } from './project-list/project-list-resolver.services';
import { LinkOrganizationComponent } from 'app/shared/components/link-organization/link-organization.component';
import { LinkOrganizationResolver } from 'app/shared/components/link-organization/link-organization-resolver.services';
import { ContactSelectComponent } from 'app/shared/components/contact-select/contact-select.component';
import { ContactsResolver } from 'app/contacts/contacts-resolver.service';
import { ProjectsRoutes } from './projects-routes';
import { AuthGuard } from '../services/auth-guard.service';
const routes: Routes = [
  {
    path: 'projects/add/:formTab/link-org',
    component: LinkOrganizationComponent,
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'projects/add/:formTab/link-contact',
    component: ContactSelectComponent,
    resolve: {
      contacts: ContactsResolver
    }
  },
  {
    path: 'projects/add',
    component: AddEditProjectComponent,
    children: ProjectsRoutes
  },
  {
    path: 'projects',
    component: ProjectListComponent,
    canActivate: [AuthGuard],
    resolve: {
      projects: ProjectListResolver
    }
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
    ProjectListResolver,
    LinkOrganizationResolver,
    AuthGuard
  ]
})

export class ProjectsRoutingModule { }
