import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { FullProject } from 'src/app/models/fullProject';
import { Project, ProjectPublishState } from 'src/app/models/project';
import { ISearchResults } from 'src/app/models/search';
import { DemiProject } from 'src/app/models/demi/project';
import { toLegacyProject } from 'src/app/models/demi/project-legacy';
import { ProjectService } from 'src/app/services/project.service';
import { SideBarService } from 'src/app/services/sidebar.service';
import { StorageService } from 'src/app/services/storage.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoggingService } from 'src/app/services/logging.service';
import { CommentPeriodBannerComponent } from '../comment-period-banner/comment-period-banner.component';
import { BannerPeriodRow, bannerPeriod } from './banner-period';

interface ProjectUser {
  id: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    styleUrl: './project-detail.component.css',
    imports: [DatePipe, RouterModule, NgbDropdownModule, CommentPeriodBannerComponent],
})

export class ProjectDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private sidebarService = inject(SideBarService);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private _cdr = inject(ChangeDetectorRef);

  public project: Project;
  public isPublished: boolean;
  public currentLegYear: number;
  public showArchivedButton = false;
  public legislationYearList: number[] = [];
  public projectID: string;
  public substantiallyStarted: string;
  public disputeResolution: string;

  ngOnInit() {
    this.projectID = this.route.parent.snapshot.paramMap.get('projId');
    // DEMI keeps only the current legislation block, so the archived years still come from eagle-api.
    const fullProject = this.route.snapshot.data['fullProject'] as ISearchResults<FullProject>[];
    this.legislationYearList = fullProject?.[0]?.data?.searchResults?.[0]?.legislationYearList ?? [];

    this.projectService.getNative(this.projectID).pipe(
      switchMap(row => forkJoin({
        users: this.projectService.getUsers<ProjectUser>([row.responsibleEPDId as string, row.projectLeadId as string]),
        periods: this.projectService.getCommentPeriods<BannerPeriodRow>(row.id, { sort: '-dateStarted', pageSize: 100 })
      }).pipe(map(({ users, periods }) => ({ project: this.toProject(row, users, periods.rows), published: row.isPublished === true }))))
    ).subscribe({
      next: ({ project, published }) => this.show(project, published),
      error: error => {
        this.logger.error('load project failed', 'ProjectDetailComponent', error);
        alert('Uh-oh, couldn\'t load project');
        this.router.navigate(['/search']);
      }
    });
  }

  private toProject(row: DemiProject, users: ProjectUser[], periods: BannerPeriodRow[]): Project {
    const project = toLegacyProject(row);
    // DEMI renamed these two Eagle fields.
    project.status = row['projectState'] as string;
    project.location = row['address'] as string;
    project.responsibleEPDObj = users.find(user => user.id === row.responsibleEPDId);
    project.projectLeadObj = users.find(user => user.id === row.projectLeadId);
    project.commentPeriodForBanner = bannerPeriod(periods);
    return project;
  }

  private show(project: Project, published: boolean) {
    this.substantiallyStarted = (project.substantially === true) ? 'Yes' : 'No';
    this.disputeResolution = (project.dispute === true) ? 'Yes' : 'No';

    // The edit form leaves this flag so the badge is right before the saved project reads back.
    const projectPublishState = this.storageService.state['projectPublishState_' + project._id];
    if (projectPublishState && projectPublishState !== ProjectPublishState.unpublished) {
      this.currentLegYear = projectPublishState;
      this.isPublished = true;
    } else {
      this.currentLegYear = project.legislationYear;
      this.isPublished = projectPublishState === ProjectPublishState.unpublished ? false : published;
    }

    this.storageService.state.currentProject = { type: 'currentProject', data: project };
    this.project = project;
    this.checkShowButton();
    this._cdr.markForCheck();
  }

  checkShowButton() {
    if (this.legislationYearList.length === 1) {
      this.showArchivedButton = false;
      this.sidebarService.hideArchive();
    } else if (this.legislationYearList.some((el) => el < this.currentLegYear) && this.currentLegYear === Math.max(...(this.legislationYearList))) {
      // If there is any legislation earlier than the currentLegYear
      this.showArchivedButton = true;
      this.sidebarService.showArchive();
    } else {
      this.showArchivedButton = false;
      this.sidebarService.hideArchive();
    }
  }

  editProject() {
    this.storageService.state.project = this.project;
    this.storageService.state.tableColumns = null;
    this.storageService.state.sortBy = null;
    this.storageService.state.form2002 = null;
    this.storageService.state.form2018 = null;
    this.storageService.state.selectedContactType = null;
    this.storageService.state.componentModel = null;
    this.storageService.state.rowComponent = null;
    this.storageService.state.back = { url: ['/p', this.project._id, 'project-details'], label: 'Edit Project' };
    this.router.navigate(['p', this.project._id, 'edit', { 1996: 'form-2002', 2002: 'form-2002', 2018: 'form-2018' }[this.project.legislationYear]]);
  }
}
