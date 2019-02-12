// modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectsRoutingModule } from './projects-routing.module';

// components
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectAsideComponent } from './project-aside/project-aside.component';
import { ProjectAddEditComponent } from './project-add-edit/project-add-edit.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { CommentDetailComponent } from './review-comments/comment-detail/comment-detail.component';

// services
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { ExcelService } from 'app/services/excel.service';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    NgxPaginationModule,
    NgbModule.forRoot(),
    ProjectsRoutingModule
  ],
  declarations: [
    ProjectListComponent,
    ProjectDetailComponent,
    ProjectAsideComponent,
    ProjectAddEditComponent,
    ReviewCommentsComponent,
    CommentDetailComponent
  ],
  exports: [
    ProjectListComponent,
    ProjectDetailComponent,
    ProjectAsideComponent,
    ProjectAddEditComponent,
    ReviewCommentsComponent,
    CommentDetailComponent
  ],
  providers: [
    ApiService,
    ProjectService,
    ExcelService
  ]
})

export class ProjectsModule { }
