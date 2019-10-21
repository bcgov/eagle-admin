// modules
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { TagInputModule } from 'ngx-chips';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProjectsRoutingModule } from './projects-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// components
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectListTableRowsComponent } from './project-list/project-list-table-rows/project-list-table-rows.component';
import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';
import { FormTab2002Component } from './add-edit-project/form-tab-2002/form-tab-2002.component';
import { FormTab2018Component } from './add-edit-project/form-tab-2018/form-tab-2018.component';
import { ActiveTabGuard } from './add-edit-project/active-tab-guard';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    TagInputModule,
    NgxPaginationModule,
    ProjectsRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [
    AddEditProjectComponent,
    ProjectListComponent,
    ProjectListTableRowsComponent,
    FormTab2002Component,
    FormTab2018Component
  ],
  entryComponents: [
    ProjectListTableRowsComponent
  ],
  exports: [
    ProjectListComponent
  ],
  providers: [
    ActiveTabGuard
  ]
})

export class ProjectsModule { }
