import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';
import { of } from 'rxjs';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-project-archived-detail',
  templateUrl: './project-archived-detail.component.html',
  styleUrls: ['./project-archived-detail.component.scss']
})

export class ProjectArchivedDetailComponent implements OnInit, OnDestroy {

  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public project: Project = null;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    public api: ApiService, // also used in template
    private _changeDetectorRef: ChangeDetectorRef,
    private dialogService: DialogService,
    public projectService: ProjectService, // also used in template
    public commentPeriodService: CommentPeriodService,
    public decisionService: DecisionService,
    private storageService: StorageService,
    public documentService: DocumentService,
  ) {
  }

  ngOnInit() {
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: Project }) => {
          if (data.project) {
            this.project = data.project;
            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
            // this.loading = false;
            this._changeDetectorRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );

    // this.project = this.projectComponent.project;
    // Handles when we come back to this page.

    // // TODO fix
    // if (this.project && this.project.intake === null) {
    //   this.project.intake = { investment: '', investmentNotes: '' };
    // }

    // if (this.project && this.project.intake.investment !== '' && this.project.intake.investment[0] !== '$') {
    //   this.project.intake.investment = this.cp.transform(this.project.intake.investment, '', true, '1.0-0');
    // }
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
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Delete Project',
          message: 'An project with submitted comments cannot be deleted.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
      return;
    }

    // if (this.project.isPublished) {
    //   this.dialogService.addDialog(ConfirmComponent,
    //     {
    //       title: 'Cannot Delete Project',
    //       message: 'Please unpublish project first.',
    //       okOnly: true
    //     }, {
    //       backdropColor: 'rgba(0, 0, 0, 0.5)'
    //     })
    //     .takeUntil(this.ngUnsubscribe);
    //   return;
    // }

    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm Deletion',
        message: 'Do you really want to delete this project?'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.internalDeleteProject();
          }
        }
      );
  }

  private internalDeleteProject() {
    this.isDeleting = true;

    let observables = of(null);

    // // delete comment period
    // if (this.project.currentPeriods) {
    //   observables = observables.concat(this.commentPeriodService.delete(this.project.currentPeriods));
    // }

    // // delete decision documents
    // if (this.project.decision && this.project.decision.documents) {
    //   for (const doc of this.project.decision.documents) {
    //     observables = observables.concat(this.documentService.delete(doc));
    //   }
    // }

    // // delete decision
    // if (this.project.decision) {
    //   observables = observables.concat(this.decisionService.delete(this.project.decision));
    // }

    // // delete project documents
    // if (this.project.documents) {
    //   for (const doc of this.project.documents) {
    //     observables = observables.concat(this.documentService.delete(doc));
    //   }
    // }

    // // delete features
    // observables = observables.concat(this.featureService.deleteByProjectId(this.project._id));

    // // delete project
    // // do this last in case of prior failures
    // observables = observables.concat(this.projectService.delete(this.project));

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
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm Publish',
        message: 'Publishing this project will make it visible to the public. Are you sure you want to proceed?'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.internalPublishProject();
          }
        }
      );
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
          this.projectService.getById(this.project._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project => {
                this.isPublishing = false;
                this.project = project;
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
          this.projectService.getById(this.project._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project => {
                this.isPublishing = false;
                this.project = project;
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
