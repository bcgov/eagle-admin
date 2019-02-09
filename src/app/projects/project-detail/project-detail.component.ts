import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
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
import { FeatureService } from 'app/services/feature.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})

export class ProjectDetailComponent implements OnInit, OnDestroy {

  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public project: Project = null;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public snackBar: MatSnackBar,
    public api: ApiService, // also used in template
    private dialogService: DialogService,
    public projectService: ProjectService, // also used in template
    public commentPeriodService: CommentPeriodService,
    public decisionService: DecisionService,
    public documentService: DocumentService,
    public featureService: FeatureService
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: Project }) => {
          if (data.project) {
            this.project = data.project;
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );
  }

  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    if (!this.project.description) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Publish Project',
          message: 'A description for this project is required to publish.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
      return;
    }

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

    let observables = of(null);

    // publish comment period
    // if (this.project.currentPeriods && !this.project.currentPeriods.isPublished) {
    //   observables = observables.concat(this.commentPeriodService.publish(this.project.currentPeriods));
    // }

    // // publish decision documents
    // if (this.project.decision && this.project.decision.documents) {
    //   for (const doc of this.project.decision.documents) {
    //     if (!doc.isPublished) {
    //       observables = observables.concat(this.documentService.publish(doc));
    //     }
    //   }
    // }

    // // publish decision
    // if (this.project.decision && !this.project.decision.isPublished) {
    //   observables = observables.concat(this.decisionService.publish(this.project.decision));
    // }

    // // publish project documents
    // if (this.project.documents) {
    //   for (const doc of this.project.documents) {
    //     if (!doc.isPublished) {
    //       observables = observables.concat(this.documentService.publish(doc));
    //     }
    //   }
    // }

    // // publish project
    // // do this last in case of prior failures
    // if (!this.project.isPublished) {
    //   observables = observables.concat(this.projectService.publish(this.project));
    // }

    // // finally, save publish date (first time only)
    // if (!this.project.publishDate) {
    //   this.project.publishDate = new Date(); // now
    //   observables = observables.concat(this.projectService.save(this.project));
    // }

    observables
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
          this.projectService.getById(this.project._id, { getFeatures: true, getDocuments: true, getCurrentPeriod: true, getDecision: false })
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

    let observables = of(null);

    // // unpublish comment period
    // if (this.project.currentPeriods && this.project.currentPeriods.isPublished) {
    //   observables = observables.concat(this.commentPeriodService.unPublish(this.project.currentPeriods));
    // }

    // // unpublish decision documents
    // if (this.project.decision && this.project.decision.documents) {
    //   for (const doc of this.project.decision.documents) {
    //     if (doc.isPublished) {
    //       observables = observables.concat(this.documentService.unPublish(doc));
    //     }
    //   }
    // }

    // // unpublish decision
    // if (this.project.decision && this.project.decision.isPublished) {
    //   observables = observables.concat(this.decisionService.unPublish(this.project.decision));
    // }

    // // unpublish project documents
    // if (this.project.documents) {
    //   for (const doc of this.project.documents) {
    //     if (doc.isPublished) {
    //       observables = observables.concat(this.documentService.unPublish(doc));
    //     }
    //   }
    // }

    // // unpublish project
    // // do this last in case of prior failures
    // if (this.project.isPublished) {
    //   observables = observables.concat(this.projectService.unPublish(this.project));
    // }

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isUnpublishing = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t unpublish project');
          // TODO: should fully reload project here so we have latest isPublished flags for objects
        },
        () => { // onCompleted
          this.snackBarRef = this.snackBar.open('Project unpublished...', null, { duration: 2000 });
          // reload all data
          this.projectService.getById(this.project._id, { getFeatures: true, getDocuments: true, getCurrentPeriod: true, getDecision: false })
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project => {
                this.isUnpublishing = false;
                this.project = project;
              },
              error => {
                this.isUnpublishing = false;
                console.log('error =', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            );
        }
      );
  }

}
