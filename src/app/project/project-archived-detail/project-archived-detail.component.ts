import { Component, OnInit, inject, ChangeDetectionStrategy} from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { mergeMap } from 'rxjs/operators';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { FullProject } from 'src/app/models/fullProject';
import { Project } from 'src/app/models/project';
import { ISearchResults } from 'src/app/models/search';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { DecisionService } from 'src/app/services/decision.service';
import { DocumentService } from 'src/app/services/document.service';
import { ProjectService } from 'src/app/services/project.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { DatePipe } from '@angular/common';
import { CommentPeriodBannerComponent } from '../comment-period-banner/comment-period-banner.component';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project-archived-detail',
    imports: [RouterModule, DatePipe, CommentPeriodBannerComponent],
    templateUrl: './project-archived-detail.component.html',
    styleUrl: './project-archived-detail.component.css',
    
})

export class ProjectArchivedDetailComponent implements OnInit {
  private router = inject(Router);
  private logger = inject(LoggingService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  private searchService = inject(SearchService);
  commentPeriodService = inject(CommentPeriodService);
  decisionService = inject(DecisionService);
  private storageService = inject(StorageService);
  documentService = inject(DocumentService);

  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public currentLeg: string;
  public project: Project = null;
  public currentLegYear: number;
  public showArchivedButton = false;
  public legislationYearList;
  public currentProject;
  public isPublished;
  public substantiallyStarted;

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    const projId = this.route.parent.snapshot.paramMap.get('projId');

      this.searchService.getSearchResults('', 'Project', [], 1, 1, '', { _id: projId }, true, {}, 'all')
        .pipe(mergeMap(data => this.projectService.getPeopleObjs(data)))
        .subscribe((data: ISearchResults<FullProject>[]) => {
          if (data && data[0]?.data?.searchResults?.length > 0) {
            const row = data[0].data.searchResults[0] as any;
            this.legislationYearList = row.legislationYearList;
            if ((this.legislationYearList).includes(2002)) {
              this.project = row.legislation_2002;
            } else {
              this.project = row.legislation_1996;
            }
            this.project._id = projId;
            this.isPublished = this.project && this.project.read && this.project.read.includes('public');
            this.substantiallyStarted = (this.project.substantially === true) ? 'Yes' : 'No';
            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
          } else {
            alert('Uh-oh, couldn\'t load project');
            this.router.navigate(['/search']);
          }
        });
  }

  editProject() {
    this.storageService.state.project = this.project;
    this.storageService.state.tableColumns = null;
    this.storageService.state.sortBy = null;
    this.storageService.state.form = null;
    this.storageService.state.selectedContactType = null;
    this.storageService.state.componentModel = null;
    this.storageService.state.rowComponent = null;
    this.storageService.state.back = { url: ['/p', this.project._id, 'project-details'], label: 'Edit Project' };
    this.router.navigate(['p', this.project._id, 'edit']);
  }

  public deleteProject() {
    if (this.project['numComments'] > 0) {
      const modalRefCannotDelete = this.modalService.open(ConfirmComponent, {
        backdrop: 'static',
        centered: true,
      });
      modalRefCannotDelete.componentInstance.title = 'Cannot Delete Project';
      modalRefCannotDelete.componentInstance.message = 'A project with submitted comments cannot be deleted.';
      modalRefCannotDelete.componentInstance.okOnly = true;
      return;
    }

    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Confirm Deletion';
    modalRef.componentInstance.message = 'Do you really want to delete this project?';

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
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Confirm Publish';
    modalRef.componentInstance.message = 'Publishing this project will make it visible to the public. Are you sure you want to proceed?';
    modalRef.componentInstance.okOnly = false;

    modalRef.result.then((result) => {
      if (result) {
        this.internalPublishProject();
      }
    }).catch(() => {});
  }

  private internalPublishProject() {
    this.isPublishing = true;

    this.projectService.publish(this.project)
      .subscribe(
        () => {},
        error => {
          this.isPublishing = false;
          this.logger.error('publish project failed', 'ProjectArchivedDetailComponent', error);
          alert('Uh-oh, couldn\'t publish project');
        },
        () => {
          this.toastService.success('Project published...');
          this.projectService.getById(this.project._id)
            .subscribe({
              next: project => {
                this.isPublishing = false;
                this.project = project;
              },
              error: error => {
                this.isPublishing = false;
                this.logger.error('reload project failed', 'ProjectArchivedDetailComponent', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            });
        }
      );
  }

  public unPublishProject() {
    this.isUnpublishing = true;

    this.projectService.unPublish(this.project)
      .subscribe({
        next: () => {},
        error: error => {
          this.isUnpublishing = false;
          this.logger.error('unpublish project failed', 'ProjectArchivedDetailComponent', error);
          alert('Uh-oh, couldn\'t unpublish project');
        },
        complete: () => {
          this.toastService.success('Project un-published...');
          this.projectService.getById(this.project._id)
            .subscribe({
              next: project => {
                this.isUnpublishing = false;
                this.project = project;
              },
              error: error => {
                this.isUnpublishing = false;
                this.logger.error('reload project failed after unpublish', 'ProjectArchivedDetailComponent', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            });
        }
      });
  }
}
