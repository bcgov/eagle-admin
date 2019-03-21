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

@NgModule({
  imports: [
    BrowserModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    NgxPaginationModule,
    MatMenuModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    ObjectFilterPipe,
    VarDirective,
    DropdownTemplateComponent,
    FileUploadComponent,
    TableTemplateComponent,
    TableDirective
  ],
  exports: [
    MatSlideToggleModule,
    MatSnackBarModule,
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    VarDirective,
    DropdownTemplateComponent,
    FileUploadComponent,
    TableTemplateComponent,
    NgxPaginationModule
  ]
})

export class SharedModule { }
