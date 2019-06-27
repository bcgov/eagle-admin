import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule, MatMenuModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';

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

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    ObjectFilterPipe,
    VarDirective,
    CommentStatsComponent,
    DropdownTemplateComponent,
    FileUploadComponent,
    TableTemplateComponent,
    TableDirective,
    ListConverterPipe,
    OrgNamePipe,
    ContactSelectComponent
  ],
  exports: [
    MatSlideToggleModule,
    MatSnackBarModule,
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    VarDirective,
    CommentStatsComponent,
    DropdownTemplateComponent,
    FileUploadComponent,
    ContactSelectComponent,
    TableTemplateComponent,
    NgxPaginationModule,
    ListConverterPipe,
    OrgNamePipe
  ],
  providers: [
    TableTemplateUtils,
    Utils
  ]
})

export class SharedModule { }
