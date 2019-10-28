import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule, MatMenuModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { OrderByPipe } from 'app/shared/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/shared/pipes/newlines.pipe';
import { PublishedPipe } from 'app/shared/pipes/published.pipe';
import { ObjectFilterPipe } from 'app/shared/pipes/object-filter.pipe';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';
import { TableTemplateComponent } from 'app/shared/components/table-template/table-template.component';
import { NgxPaginationModule } from 'ngx-pagination';

import { TableDirective } from './components/table-template/table.directive';
import { DropdownTemplateComponent } from './components/dropdown-template/dropdown-template.component';
import { TableTemplateUtils } from './utils/table-template-utils';
import { CommentStatsComponent } from './components/comment-stats/comment-stats.component';
import { ListConverterPipe } from './pipes/list-converter.pipe';
import { OrgNamePipe } from './pipes/org-name.pipe';
import { Utils } from './utils/utils';
import { ContactSelectComponent } from './components/contact-select/contact-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <== add the imports!
import { RouterModule } from '@angular/router';
import { LinkOrganizationComponent } from './components/link-organization/link-organization.component';
import { LinkOrganizationTableRowsComponent } from './components/link-organization/link-organization-table-rows/link-organization-table-rows.component';
import { NavigationStackUtils } from './utils/navigation-stack-utils';
import { ContactSelectTableRowsComponent } from './components/contact-select-table-rows/contact-select-table-rows.component';
import { ExtensionComponent } from './components/extension/extension.component';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    NgbModule
  ],
  declarations: [
    CommentStatsComponent,
    ContactSelectComponent,
    ContactSelectTableRowsComponent,
    DropdownTemplateComponent,
    FileUploadComponent,
    LinkOrganizationComponent,
    LinkOrganizationTableRowsComponent,
    ListConverterPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    OrderByPipe,
    OrgNamePipe,
    PublishedPipe,
    TableDirective,
    TableTemplateComponent,
    VarDirective,
    ExtensionComponent
  ],
  entryComponents: [
    ContactSelectTableRowsComponent
  ],
  exports: [
    CommentStatsComponent,
    ContactSelectComponent,
    ContactSelectTableRowsComponent,
    DropdownTemplateComponent,
    FileUploadComponent,
    LinkOrganizationComponent,
    LinkOrganizationTableRowsComponent,
    ListConverterPipe,
    MatSlideToggleModule,
    MatSnackBarModule,
    NewlinesPipe,
    NgxPaginationModule,
    OrderByPipe,
    OrgNamePipe,
    PublishedPipe,
    TableTemplateComponent,
    VarDirective
  ],
  providers: [
    TableTemplateUtils,
    NavigationStackUtils,
    Utils
  ]
})

export class SharedModule { }
