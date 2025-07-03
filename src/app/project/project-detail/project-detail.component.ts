import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { FullProject } from 'src/app/models/fullProject';
import { Project, ProjectPublishState } from 'src/app/models/project';
import { ISearchResults } from 'src/app/models/search';
import { ApiService } from 'src/app/services/api';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { DecisionService } from 'src/app/services/decision.service';
import { DocumentService } from 'src/app/services/document.service';
import { ProjectService } from 'src/app/services/project.service';
import { SideBarService } from 'src/app/services/sidebar.service';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, NgbDropdownModule],
})


export class ProjectDetailComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  snackBar = inject(MatSnackBar);
  api = inject(ApiService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  commentPeriodService = inject(CommentPeriodService);
  sidebarService = inject(SideBarService);
  decisionService = inject(DecisionService);
  private storageService = inject(StorageService);
  documentService = inject(DocumentService);
  private utils = inject(Utils);


  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public project: Project;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private subscriptions = new Subscription();
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
    // This is to get Region information from List (db) and put into a list(regions)
    this.subscriptions.add(
      this.route.parent.data
        .subscribe(
          (data: { project: ISearchResults<Project>[] }) => {
            if (data.project) {
              const results = this.utils.extractFromSearchResults(data.project);
              this.project = results ? results[0] : null;
              this.projectID = this.project._id;
              const projectPublishState = this.storageService.state['projectPublishState_' + this.project._id];
              if (projectPublishState && projectPublishState !== ProjectPublishState.unpublished) {
                this.currentLegYear = projectPublishState;
                this.isPublished = true;
              } else {
                this.currentLegYear = this.project.legislationYear;
                this.isPublished = projectPublishState === ProjectPublishState.unpublished ?
                  false : this.project && this.project.read.includes('public');
              }
              this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
              this._changeDetectorRef.detectChanges();
            } else {
              alert('Uh-oh, couldn\'t load project');
              // project not found --> navigate back to search
              this.router.navigate(['/search']);
            }
          }
        ));

    // Get data related to current project
    this.subscriptions.add(
      this.route.data
        .subscribe((data: { fullProject: ISearchResults<FullProject>[] }) => {
          const projectKey = data.fullProject[0].data.searchResults[0].currentLegislationYear;
          this.project = data.fullProject[0].data.searchResults[0][projectKey];
          this.project._id = this.projectID;
          this.legislationYearList = data.fullProject[0].data.searchResults[0].legislationYearList;
          this.currentLeg = data.fullProject[0].data.searchResults[0].currentLegislationYear;
          this.substantiallyStarted = (this.project.substantially === true) ? 'Yes' : 'No';
          this.disputeResolution = (this.project.dispute === true) ? 'Yes' : 'No';

          // Set published state
          const projectPublishState = this.storageService.state['projectPublishState_' + this.project._id];
          if (projectPublishState && projectPublishState !== ProjectPublishState.unpublished) {
            this.currentLegYear = projectPublishState;
          } else { this.currentLegYear = Number((this.currentLeg).substring(this.currentLeg.length - 4, this.currentLeg.length)); }
          this._changeDetectorRef.detectChanges();
        }));

    this.checkShowButton();

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
    // this.isDeleting = true;

    // const observables = of(null);

    // observables
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     () => { // onNext
    //       // do nothing here - see onCompleted() function below
    //     },
    //     error => {
    //       this.isDeleting = false;
    //       console.log('error =', error);
    //       alert('Uh-oh, couldn\'t delete project');
    //       // TODO: should fully reload project here so we have latest non-deleted objects
    //     },
    //     () => { // onCompleted
    //       this.isDeleting = false;
    //       // delete succeeded --> navigate back to search
    //       this.router.navigate(['/search']);
    //     }
    //   );

    this.isDeleting = false;
    // delete succeeded --> navigate back to search
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

    this.subscriptions.add(
      this.projectService.publish(this.project)
        .subscribe({
          next: () => {
            // do nothing here - see complete below
          },
          error: error => {
            this.isPublishing = false;
            console.log('error =', error);
            alert('Uh-oh, couldn\'t publish project');
            // TODO: should fully reload project here so we have latest isPublished flags for objects
          },
          complete: () => {
            this.snackBarRef = this.snackBar.open('Project published...', null, { duration: 2000 });
            // reload all data
            this.subscriptions.add(
              this.projectService.getById(this.project._id)
                .subscribe({
                  next: project => {
                    this.isPublishing = false;
                    this.project = project;
                    this.isPublished = true;
                  },
                  error: error => {
                    this.isPublishing = false;
                    console.log('error =', error);
                    alert('Uh-oh, couldn\'t reload project');
                  }
                })
            );
          }
        })
    );
  }

  public unPublishProject() {
    this.isUnpublishing = true;

    this.subscriptions.add(
      this.projectService.unPublish(this.project)
        .subscribe({
          next: () => {
            // do nothing here - see complete below
          },
          error: error => {
            this.isPublishing = false;
            console.log('error =', error);
            alert('Uh-oh, couldn\'t publish project');
            // TODO: should fully reload project here so we have latest isPublished flags for objects
          },
          complete: () => {
            this.snackBarRef = this.snackBar.open('Project un-published...', null, { duration: 2000 });
            // reload all data
            this.subscriptions.add(
              this.projectService.getById(this.project._id)
                .subscribe({
                  next: project => {
                    this.isPublishing = false;
                    this.project = project;
                    this.isPublished = false;
                  },
                  error: error => {
                    this.isPublishing = false;
                    console.log('error =', error);
                    alert('Uh-oh, couldn\'t reload project');
                  }
                })
            );
          }
        })
    );
  }

  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.subscriptions.unsubscribe();
  }
}
