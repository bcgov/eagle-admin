import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';

// modules
import { SharedModule } from 'app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    RouterModule,
    SharedModule,
  ],
  declarations: [
  ],
  entryComponents: [
  ]
})
export class CommentPeriodsModule { }
