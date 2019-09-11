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
    ProjectListTableRowsComponent
  ],
  entryComponents: [
    ProjectListTableRowsComponent
  ],
  exports: [
    ProjectListComponent
  ],
  providers: [
  ]
})

export class ProjectsModule { }
