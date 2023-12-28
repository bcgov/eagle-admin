// modules
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ProjectRoutingModule } from './project-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditorModule } from '@tinymce/tinymce-angular';

// components
import { DocumentDetailComponent } from './project-documents/detail/detail.component';
import { DocumentApplicationSortComponent } from './project-documents/application-sort/application-sort.component';
import { DocumentTableRowsComponent } from './project-documents/project-document-table-rows/project-document-table-rows.component';
import { MatTabsModule, MatMenuModule } from '@angular/material';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectGroupsComponent } from './project-groups/project-groups.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectArchivedDetailComponent } from './project-archived-detail/project-archived-detail.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';

// services
import { ApiService } from 'app/services/api';
import { ExcelService } from 'app/services/excel.service';
import { ProjectService } from 'app/services/project.service';
import { StorageService } from 'app/services/storage.service';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';
import { CommentPeriodBannerComponent } from './comment-period-banner/comment-period-banner.component';
import { PinsListComponent } from './pins-list/pins-list.component';
import { GroupsTableRowsComponent } from './project-groups/project-groups-table-rows/project-groups-table-rows.component';
import { ApplicationSortTableRowsComponent } from './project-documents/application-sort/application-sort-table-rows/application-sort-table-rows.component';
import { GroupContactComponent } from './project-groups/group-contact/group-contact.component';
import { GroupContactSelectComponent } from './project-groups/group-contact/group-contact-select/group-contact-select.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    MatMenuModule,
    MatTabsModule,
    ProjectRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    EditorModule,
    NgSelectModule
  ],
  declarations: [
    CommentPeriodBannerComponent,
    DocumentDetailComponent,
    DocumentApplicationSortComponent,
    DocumentEditComponent,
    DocumentTableRowsComponent,
    GroupContactComponent,
    GroupContactSelectComponent,
    GroupsTableRowsComponent,
    ApplicationSortTableRowsComponent,
    MilestonesComponent,
    PinsListComponent,
    ProjectDetailComponent,
    ProjectArchivedDetailComponent,
    ProjectDocumentsComponent,
    ProjectGroupsComponent,
    ProjectUpdatesComponent,
  ],
  entryComponents: [
    DocumentTableRowsComponent,
    GroupContactSelectComponent,
    GroupsTableRowsComponent,
    ApplicationSortTableRowsComponent,
  ],
  exports: [
    MilestonesComponent,
    ProjectGroupsComponent,
    ProjectDetailComponent,
    ProjectArchivedDetailComponent,
    ProjectUpdatesComponent,
    PinsListComponent
  ],
  providers: [
    ApiService,
    ExcelService,
    ProjectService,
    StorageService
  ]
})

export class ProjectModule { }
