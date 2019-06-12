import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectListComponent } from './project-list/project-list.component';
import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';
import { ProjectListResolver } from './project-list/project-list-resolver.services';

const routes: Routes = [
  {
    path: 'projects/add',
    component: AddEditProjectComponent
  },
  {
    path: 'projects',
    component: ProjectListComponent,
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
    ProjectListResolver
  ]
})

export class ProjectsRoutingModule { }
