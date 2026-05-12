import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { mergeMap } from 'rxjs/operators';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { FullProject } from 'src/app/models/fullProject';
import { Project, ProjectPublishState } from 'src/app/models/project';
import { ISearchResults } from 'src/app/models/search';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { DecisionService } from 'src/app/services/decision.service';
import { DocumentService } from 'src/app/services/document.service';
import { ProjectService } from 'src/app/services/project.service';
import { SearchService } from 'src/app/services/search.service';
import { SideBarService } from 'src/app/services/sidebar.service';
import { StorageService } from 'src/app/services/storage.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    styleUrl: './project-detail.component.css',
    imports: [DatePipe, RouterModule, NgbDropdownModule],
})

export class ProjectDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  private searchService = inject(SearchService);
  commentPeriodService = inject(CommentPeriodService);
  sidebarService = inject(SideBarService);
  decisionService = inject(DecisionService);
  private storageService = inject(StorageService);
  documentService = inject(DocumentService);
  private logger = inject(LoggingService);
  private _cdr = inject(ChangeDetectorRef);

  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public project: Project;
  public isPublished: boolean;
  public currentLeg: string;
  public currentLegYear: number;
  public showArchivedButton = false;
  public legislationYearList;
  public currentProject: Project;
  public projectID: string;
  public substantiallyStarted: string;
  public disputeResolution: string;

  ngOnInit() {
    const projId = this.route.parent.snapshot.paramMap.get('projId');
    this.projectID = projId;

    // Load full project data directly (covers both ProjectResolver + FullProjectResolver)
      this.searchService.getSearchResults('', 'Project', [], 1, 1, '', { _id: projId }, true, {}, 'all')
        .pipe(mergeMap(data => this.projectService.getPeopleObjs(data)))
        .subscribe((data: ISearchResults<FullProject>[]) => {
          if (data && data[0]?.data?.searchResults?.length > 0) {
            const fullProject = data[0].data.searchResults[0] as any;
            const projectKey = fullProject.currentLegislationYear;
            this.project = fullProject[projectKey];
            this.project._id = this.projectID;
            this.legislationYearList = fullProject.legislationYearList;
            this.currentLeg = fullProject.currentLegislationYear;
            this.substantiallyStarted = (this.project.substantially === true) ? 'Yes' : 'No';
            this.disputeResolution = (this.project.dispute === true) ? 'Yes' : 'No';

            const projectPublishState = this.storageService.state['projectPublishState_' + this.project._id];
            if (projectPublishState && projectPublishState !== ProjectPublishState.unpublished) {
              this.currentLegYear = projectPublishState;
              this.isPublished = true;
            } else {
              this.currentLegYear = Number((this.currentLeg).substring(this.currentLeg.length - 4, this.currentLeg.length));
              const fullProjectRead: string[] = fullProject.read || [];
              this.isPublished = projectPublishState === ProjectPublishState.unpublished
                ? false
                : fullProjectRead.includes('public');
            }

            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
            this.checkShowButton();
            this._cdr.markForCheck();
          } else {
            alert('Uh-oh, couldn\'t load project');
            this.router.navigate(['/search']);
          }
        });
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

  public deleteProject() {
    if (this.project['numComments'] > 0) {
      const modalRefCannotDelete = this.modalService.open(ConfirmComponent, {
        backdrop: 'static',
        centered: true,
      });
      modalRefCannotDelete.componentInstance.title = 'Cannot Delete Project';
      modalRefCannotDelete.componentInstance.message = 'A project with submitted comments cannot be deleted.';
      modalRefCannotDelete.componentInstance.okOnly = true; // Set okOnly to true for only OK button

      return;
    }

    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Confirm Deletion';
    modalRef.componentInstance.message = 'Do you really want to delete this project?';
    modalRef.componentInstance.okOnly = false; // Set okOnly to false for both OK and Cancel options

    modalRef.result.then((result) => {
      if (result) {
        this.internalDeleteProject();
      }
    }).catch(() => {
      // Handle error
    });
  }

  private internalDeleteProject() {
    this.isDeleting = false;
    this.router.navigate(['/search']);
  }

  public publishProject() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static', // Prevent closing when clicking outside the modal
      centered: true, // Center the modal on the screen
    });
    modalRef.componentInstance.title = 'Confirm Publish';
    modalRef.componentInstance.message = 'Publishing this project will make it visible to the public. Are you sure you want to proceed?';
    modalRef.componentInstance.okOnly = false; // Set okOnly to false for both OK and Cancel buttons

    modalRef.result.then((result) => {
      if (result) {
        this.internalPublishProject();
      }
    }).catch(() => {
      // Handle error
    });
  }

  private internalPublishProject() {
    this.isPublishing = true;

    this.projectService.publish(this.project)
      .subscribe({
        next: () => {},
        error: error => {
          this.isPublishing = false;
          this.logger.error('publish project failed', 'ProjectDetailComponent', error);
          alert('Uh-oh, couldn\'t publish project');
        },
        complete: () => {
          this.toastService.success('Project published...');
          this.projectService.getById(this.project._id)
            .subscribe({
              next: project => {
                this.isPublishing = false;
                this.project = project;
                this.isPublished = true;
              },
              error: error => {
                this.isPublishing = false;
                this.logger.error('reload project failed', 'ProjectDetailComponent', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            });
        }
      });
  }

  public unPublishProject() {
    this.isUnpublishing = true;

    this.projectService.unPublish(this.project)
      .subscribe({
        next: () => {},
        error: error => {
          this.isUnpublishing = false;
          this.logger.error('unpublish project failed', 'ProjectDetailComponent', error);
          alert('Uh-oh, couldn\'t unpublish project');
        },
        complete: () => {
          this.toastService.success('Project un-published...');
          this.projectService.getById(this.project._id)
            .subscribe({
              next: project => {
                this.isUnpublishing = false;
                this.project = project;
                this.isPublished = false;
              },
              error: error => {
                this.isUnpublishing = false;
                this.logger.error('reload project failed after unpublish', 'ProjectDetailComponent', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            });
        }
      });
  }
}
