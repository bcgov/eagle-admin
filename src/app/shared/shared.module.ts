import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';

import { OrderByPipe } from 'app/shared/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/shared/pipes/newlines.pipe';
import { PublishedPipe } from 'app/shared/pipes/published.pipe';
import { ObjectFilterPipe } from 'app/shared/pipes/object-filter.pipe';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';
import { ItemTableComponent } from 'app/shared/components/item-table/item-table.component'

@NgModule({
  imports: [
    BrowserModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    ObjectFilterPipe,
    VarDirective,
    FileUploadComponent,
    ItemTableComponent
  ],
  exports: [
    MatSlideToggleModule,
    MatSnackBarModule,
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    VarDirective,
    FileUploadComponent,
    ItemTableComponent
  ]
})

export class SharedModule { }
