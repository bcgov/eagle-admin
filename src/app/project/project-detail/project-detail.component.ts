import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';
import { of } from 'rxjs';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { Project, ProjectPublishState } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';
import { ISearchResults } from 'app/models/search';
import { Utils } from 'app/shared/utils/utils';
import { SideBarService } from 'app/services/sidebar.service';
import { FullProject } from 'app/models/fullProject';


@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})


export class ProjectDetailComponent implements OnInit, OnDestroy {

  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public project: Project;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public isPublished: boolean;
  public currentLeg: String;
  public currentLegYear: number;
  public showArchivedButton = false;
  public legislationYearList;
  public currentProject: Project;
  public projectID: string;
  public substantiallyStarted: string;
  public disputeResolution: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    public api: ApiService, // also used in template
    private _changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    public projectService: ProjectService, // also used in template
    public commentPeriodService: CommentPeriodService,
    public sidebarService: SideBarService,
    public decisionService: DecisionService,
    private storageService: StorageService,
    public documentService: DocumentService,
    private utils: Utils

  ) {
  }

  ngOnInit() {
    // This is to get Region information from List (db) and put into a list(regions)
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: ISearchResults<Project>[] }) => {
          if (data.project) {
            const results = this.utils.extractFromSearchResults(data.project);
            this.project = results ? results[0] :  null;
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
      );

    // Get data related to current project
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: { fullProject: ISearchResults<FullProject>[] }) => {
        const projectKey = data.fullProject[0].data.searchResults[0].currentLegislationYear;
        this.project = data.fullProject[0].data.searchResults[0][projectKey];
        this.project._id = this.projectID;
        this.legislationYearList = data.fullProject[0].data.searchResults[0].legislationYearList;
        this.currentLeg = data.fullProject[0].data.searchResults[0].currentLegislationYear;
        this.substantiallyStarted = (this.project.substantially === true ) ? 'Yes' : 'No';
        this.disputeResolution = (this.project.dispute === true ) ? 'Yes' : 'No';

        // Set published state
        const projectPublishState = this.storageService.state['projectPublishState_' + this.project._id ];
        if (projectPublishState && projectPublishState !== ProjectPublishState.unpublished) {
          this.currentLegYear = projectPublishState;
        } else {this.currentLegYear = Number((this.currentLeg).substring(this.currentLeg.length - 4, this.currentLeg.length)); }
        this._changeDetectorRef.detectChanges();
      });

      this.checkShowButton();

  }

  checkShowButton() {
    if ( this.legislationYearList.length === 1) {
      this.showArchivedButton = false;
      this.sidebarService.hideArchive();
    } else if ( this.legislationYearList.some( (el) => el < this.currentLegYear) && this.currentLegYear === Math.max(...(this.legislationYearList))) {
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
    this.router.navigate(['p', this.project._id , 'edit', {1996: 'form-2002', 2002: 'form-2002', 2018: 'form-2018'}[this.project.legislationYear]]);
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
    this.isDeleting = true;

    let observables = of(null);

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isDeleting = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t delete project');
          // TODO: should fully reload project here so we have latest non-deleted objects
        },
        () => { // onCompleted
          this.isDeleting = false;
          // delete succeeded --> navigate back to search
          this.router.navigate(['/search']);
        }
      );
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
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isPublishing = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t publish project');
          // TODO: should fully reload project here so we have latest isPublished flags for objects
        },
        () => { // onCompleted
          this.snackBarRef = this.snackBar.open('Project published...', null, { duration: 2000 });
          // reload all data
          this.projectService.getById(this.project._id )
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project => {
                this.isPublishing = false;
                this.project = project;
                this.isPublished = true;
              },
              error => {
                this.isPublishing = false;
                console.log('error =', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            );
        }
      );
  }

  public unPublishProject() {
    this.isUnpublishing = true;

    this.projectService.unPublish(this.project)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isPublishing = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t publish project');
          // TODO: should fully reload project here so we have latest isPublished flags for objects
        },
        () => { // onCompleted
          this.snackBarRef = this.snackBar.open('Project un-published...', null, { duration: 2000 });
          // reload all data
          this.projectService.getById(this.project._id )
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project => {
                this.isPublishing = false;
                this.project = project;
                this.isPublished = false;
              },
              error => {
                this.isPublishing = false;
                console.log('error =', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            );
        }
      );
  }

  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
