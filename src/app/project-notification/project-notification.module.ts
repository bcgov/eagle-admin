// modules
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ProjectNotificationRoutingModule } from './project-notification-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';

// components
import { ProjectNotificationComponent } from './project-notification.component';
import { PnDocumentTableRowsComponent } from './documents/project-notification-document-table-rows/project-notification-document-table-rows.component';
import { UploadComponent } from './documents/upload/upload.component';
// services
import { ProjectNotificationDetailComponent } from './detail/project-notification-detail.component';
import { ProjectNotificationDocumentsComponent } from './documents/project-notification-documents.component';
import { ApiService } from '../services/api';
import { ExcelService } from '../services/excel.service';
import { StorageService } from '../services/storage.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ProjectNotificationRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
  ],
  declarations: [
    UploadComponent,
    ProjectNotificationDetailComponent,
    ProjectNotificationComponent,
    ProjectNotificationDocumentsComponent,
    PnDocumentTableRowsComponent,
  ],
  entryComponents: [
    ProjectNotificationComponent,
    ProjectNotificationDetailComponent,
    ProjectNotificationDocumentsComponent,
    PnDocumentTableRowsComponent,
    UploadComponent,
  ],
  exports: [
  ],
  providers: [
    ApiService,
    ExcelService,
    StorageService
  ]
})

export class ProjectNotificationModule { }
