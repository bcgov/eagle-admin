// modules
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ProjectsRoutingModule } from './projects-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

// components
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectListTableRowsComponent } from './project-list/project-list-table-rows/project-list-table-rows.component';
import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';
import { FormTab2002Component } from './add-edit-project/form-tab-2002/form-tab-2002.component';
import { FormTab2018Component } from './add-edit-project/form-tab-2018/form-tab-2018.component';
import { ModificationsListTableRowsComponent } from './add-edit-project/modifications-list-table-rows/modifications-list-table-rows.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    ProjectsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  declarations: [
    AddEditProjectComponent,
    ProjectListComponent,
    ProjectListTableRowsComponent,
    FormTab2002Component,
    FormTab2018Component,
    ModificationsListTableRowsComponent
  ],
  entryComponents: [
    ProjectListTableRowsComponent,
    ModificationsListTableRowsComponent
  ],
  exports: [
    ProjectListComponent
  ],
  providers: [
  ]
})

export class ProjectsModule { }
