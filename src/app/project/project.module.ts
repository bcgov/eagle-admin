// modules
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProjectRoutingModule } from './project-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

// components
import { AddEditCommentPeriodComponent } from './comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddLabelComponent } from './project-documents/add-label/add-label.component';
import { CommentPeriodComponent } from './comment-period/comment-period.component';
import { CommentPeriodDetailsTabComponent } from './comment-period/comment-period-details-tabs/comment-period-details-tab.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { CommentPeriodsTableRowsComponent } from './comment-periods/comment-periods-table-rows/comment-periods-table-rows.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { DocumentDetailComponent } from './project-documents/detail/detail.component';
import { InspectionDetailComponent } from './compliance/inspection-detail/inspection-detail.component';
import { DocumentTableRowsComponent } from './project-documents/project-document-table-rows/project-document-table-rows.component';
import { ComplianceTableRowsComponent } from './compliance/compliance-table-rows/compliance-table-rows.component';
import { IndigenousNationsComponent } from './indigenous-nations/indigenous-nations.component';
import { MatTabsModule, MatMenuModule } from '@angular/material';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectGroupsComponent } from './project-groups/project-groups.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectArchivedDetailComponent } from './project-archived-detail/project-archived-detail.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ProjectCACComponent } from './project-cac/project-cac.component';
import { ReviewCommentsTabComponent } from './comment-period/review-comments-tab/review-comments-tab.component';
import { ReviewCommentsTabTableRowsComponent } from './comment-period/review-comments-tab/review-comments-tab-table-rows/review-comments-tab-table-rows.component';
import { UploadComponent } from './project-documents/upload/upload.component';
import { ValuedComponentsComponent } from './valued-components/valued-components.component';
import { ValuedComponentTableRowsComponent } from './valued-components/valued-component-table-rows/valued-component-table-rows.component';
import { TopicTableRowsComponent } from './valued-components/add-vc/topic-table-rows/topic-table-rows.component';

// services
import { ApiService } from 'app/services/api';
import { ExcelService } from 'app/services/excel.service';
import { ProjectService } from 'app/services/project.service';
import { StorageService } from 'app/services/storage.service';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';
import { AddVcComponent } from './valued-components/add-vc/add-vc.component';
import { ReviewCommentComponent } from './comment-period/review-comment/review-comment.component';
import { GetValuedComponentsComponent } from './comment-period/review-comment/get-valued-components/get-valued-components.component';
import { GetValuedComponentTableRowsComponent } from './comment-period/review-comment/get-valued-components/get-valued-component-table-rows/get-valued-component-table-rows.component';
import { AddDocumentComponent } from './comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddDocumentTableRowsComponent } from './comment-periods/add-edit-comment-period/add-documents/add-document-table-rows/add-document-table-rows.component';
import { AddCommentComponent } from './comment-period/add-comment/add-comment.component';
import { CommentPeriodBannerComponent } from './comment-period-banner/comment-period-banner.component';
import { PinsListComponent } from './pins-list/pins-list.component';
import { GroupsTableRowsComponent } from './project-groups/project-groups-table-rows/project-groups-table-rows.component';
import { GroupContactComponent } from './project-groups/group-contact/group-contact.component';
import { GroupContactSelectComponent } from './project-groups/group-contact/group-contact-select/group-contact-select.component';
import { ElementTableRowsComponent } from './compliance/inspection-detail/element-table-rows/element-table-rows.component';
import { SubmissionDetailComponent } from './compliance/submission-detail/submission-detail.component';
import { AssetTableRowsComponent } from './compliance/submission-detail/asset-table-rows/asset-table-rows.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    MatMenuModule,
    MatTabsModule,
    NgxPaginationModule,
    ProjectRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule
  ],
  declarations: [
    AssetTableRowsComponent,
    AddCommentComponent,
    AddDocumentComponent,
    AddDocumentTableRowsComponent,
    AddEditCommentPeriodComponent,
    AddLabelComponent,
    AddVcComponent,
    CommentPeriodBannerComponent,
    CommentPeriodComponent,
    CommentPeriodDetailsTabComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
    ComplianceComponent,
    InspectionDetailComponent,
    ComplianceTableRowsComponent,
    DocumentDetailComponent,
    DocumentEditComponent,
    DocumentTableRowsComponent,
    ElementTableRowsComponent,
    GetValuedComponentsComponent,
    GetValuedComponentTableRowsComponent,
    GroupContactComponent,
    GroupContactSelectComponent,
    GroupsTableRowsComponent,
    IndigenousNationsComponent,
    MilestonesComponent,
    PinsListComponent,
    ProjectDetailComponent,
    ProjectArchivedDetailComponent,
    ProjectDocumentsComponent,
    ProjectGroupsComponent,
    ProjectUpdatesComponent,
    ProjectCACComponent,
    ReviewCommentComponent,
    ReviewCommentsTabComponent,
    ReviewCommentsTabTableRowsComponent,
    SubmissionDetailComponent,
    TopicTableRowsComponent,
    UploadComponent,
    ValuedComponentsComponent,
    ValuedComponentTableRowsComponent
  ],
  entryComponents: [
    AssetTableRowsComponent,
    AddDocumentTableRowsComponent,
    CommentPeriodComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
    ComplianceTableRowsComponent,
    DocumentTableRowsComponent,
    ElementTableRowsComponent,
    GetValuedComponentTableRowsComponent,
    GroupContactSelectComponent,
    GroupsTableRowsComponent,
    ReviewCommentsTabTableRowsComponent,
    TopicTableRowsComponent,
    UploadComponent,
    ValuedComponentTableRowsComponent
  ],
  exports: [
    ComplianceComponent,
    IndigenousNationsComponent,
    MilestonesComponent,
    ProjectGroupsComponent,
    ProjectDetailComponent,
    ProjectArchivedDetailComponent,
    ProjectUpdatesComponent,
    ProjectCACComponent,
    ValuedComponentsComponent,
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
