// modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProjectsRoutingModule } from './projects-routing.module';
import { SharedModule } from 'app/shared.module';

// components
import { CommentDetailComponent } from './review-comments/comment-detail/comment-detail.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { ExcelService } from 'app/services/excel.service';
import { IndigenousNationsComponent } from './indigenous-nations/indigenous-nations.component';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectAddEditComponent } from './project-add-edit/project-add-edit.component';
import { ProjectAsideComponent } from './project-aside/project-aside.component';
import { ProjectContactsComponent } from './project-contacts/project-contacts.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { ValuedComponentsComponent } from './valued-components/valued-components.component';

// services
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    ProjectsRoutingModule,
    SharedModule
  ],
  declarations: [
    CommentDetailComponent,
    CommentPeriodsComponent,
    ComplianceComponent,
    IndigenousNationsComponent,
    MilestonesComponent,
    ProjectAddEditComponent,
    ProjectAsideComponent,
    ProjectContactsComponent,
    ProjectDetailComponent,
    ProjectListComponent,
    ProjectUpdatesComponent,
    ReviewCommentsComponent,
    ValuedComponentsComponent
  ],
  exports: [
    CommentDetailComponent,
    ProjectAddEditComponent,
    ProjectAsideComponent,
    ProjectDetailComponent,
    ProjectListComponent,
    ReviewCommentsComponent
  ],
  providers: [
    ApiService,
    ExcelService,
    ProjectService
  ]
})

export class ProjectsModule { }
