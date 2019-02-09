import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
// import { Location } from '@angular/common';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { Project } from 'app/models/project';
import { CommentPeriod } from 'app/models/commentperiod';
import { Document } from 'app/models/document';
import { Decision } from 'app/models/decision';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';

const DEFAULT_DAYS = 30;

@Component({
  selector: 'app-project-add-edit',
  templateUrl: './project-add-edit.component.html',
  styleUrls: ['./project-add-edit.component.scss']
})

export class ProjectAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('projectForm') projectForm: NgForm;

  public isSubmitSaveClicked = false;
  public isSubmitting = false;
  public isSaving = false;
  public project: Project = null;
  public startDate: NgbDateStruct = null;
  public endDate: NgbDateStruct = null;
  public delta: number; // # days (including today)
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private docsToDelete: Document[] = [];
  private decisionToDelete: Decision = null;
  public projectFiles: Array<File> = [];
  public decisionFiles: Array<File> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private location: Location,
    public snackBar: MatSnackBar,
    public api: ApiService, // also also used in template
    private projectService: ProjectService,
    private commentPeriodService: CommentPeriodService,
    private dialogService: DialogService,
    private decisionService: DecisionService,
    private documentService: DocumentService
  ) {
    // if we have URL fragment, scroll to specified section
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = router.parseUrl(router.url);
        if (url && url.fragment) {
          // ensure element exists
          const element = document.getElementById(url.fragment);
          if (element) {
            element.scrollIntoView();
          }
        }
      }
    });
  }

  // check for unsaved changes before closing (or reloading) current tab/window
  @HostListener('window:beforeunload', ['$event'])
  public handleBeforeUnload(event) {
    if (!this.projectForm) {
      event.returnValue = true; // no form means page error -- allow unload
    }

    // display browser alert if needed
    if (this.projectForm.dirty || this.anyUnsavedItems()) {
      event.returnValue = true;
    }
  }

  // check for unsaved changes before navigating away from current route (ie, this page)
  public canDeactivate(): Observable<boolean> | boolean {
    if (!this.projectForm) {
      return true; // no form means page error -- allow deactivate
    }

    // allow synchronous navigation if everything is OK
    if (!this.projectForm.dirty && !this.anyUnsavedItems()) {
      return true;
    }

    // otherwise prompt the user with observable (asynchronous) dialog
    return this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Unsaved Changes',
        message: 'Click OK to discard your changes or Cancel to return to the project.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe);
  }

  // this is needed because we don't have a form control that is marked as dirty
  private anyUnsavedItems(): boolean {
    // // look for project documents not yet uploaded to db
    // if (this.project.documents) {
    //   for (const doc of this.project.documents) {
    //     if (!doc._id) {
    //       return true;
    //     }
    //   }
    // }

    // // look for decision documents not yet uploaded to db
    // if (this.project.decision && this.project.decision.documents) {
    //   for (const doc of this.project.decision.documents) {
    //     if (!doc._id) {
    //       return true;
    //     }
    //   }
    // }

    // look for project or decision documents not yet removed from db
    if (this.docsToDelete && this.docsToDelete.length > 0) {
      return true;
    }

    // look for decision not yet removed from db
    if (this.decisionToDelete) {
      return true;
    }

    return false; // no unsaved items
  }

  public cancelChanges() {
    // this.location.back(); // FAILS WHEN CANCEL IS CANCELLED (DUE TO DIRTY FORM OR UNSAVED DOCUMENTS) MULTIPLE TIMES

    if (this.project._id) {
      // go to details page
      this.router.navigate(['/a', this.project._id]);
    } else {
      // go to search page
      this.router.navigate(['/search']);
    }
  }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: Project }) => {
          if (data.project) {
            this.project = data.project;

            // add comment period if there isn't one already (not just on create but also on edit --
            // this will fix the situation where existing projects don't have a comment period)
            // if (!this.project.currentPeriods) {
            //   this.project.currentPeriods = new CommentPeriod();
            //   // set startDate
            //   const now = new Date();
            //   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            //   this.project.currentPeriods.startDate = today;
            //   this.startDate = this.dateToNgbDate(this.project.currentPeriods.startDate);
            //   // set delta and endDate
            //   this.onDeltaChg(DEFAULT_DAYS);
            // } else {
            //   // set startDate
            //   this.startDate = this.dateToNgbDate(this.project.currentPeriods.startDate);
            //   // set endDate and delta
            //   this.endDate = this.dateToNgbDate(this.project.currentPeriods.endDate);
            //   this.onEndDateChg(this.endDate);
            // }
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

  private dateToNgbDate(date: Date): NgbDateStruct {
    return date ? { 'year': date.getFullYear(), 'month': date.getMonth() + 1, 'day': date.getDate() } : null;
  }

  private ngbDateToDate(date: NgbDateStruct): Date {
    return new Date(date.year, (date.month - 1), date.day);
  }

  // used in template
  public isValidDate(date: NgbDateStruct): boolean {
    return (date && !isNaN(date.year) && !isNaN(date.month) && !isNaN(date.day));
  }

  public onStartDateChg(startDate: NgbDateStruct) {
    if (startDate !== null) {
      // this.project.currentPeriods.startDate = this.ngbDateToDate(startDate);
      // to set dates, we also need delta
      if (this.delta) {
        this.setDates(true, false, false);
      }
    }
  }

  public onDeltaChg(delta: number) {
    if (delta !== null) {
      this.delta = delta;
      // to set dates, we also need start date
      // if (this.project.currentPeriods.startDate) {
      //   this.setDates(false, true, false);
      // }
    }
  }

  public onEndDateChg(endDate: NgbDateStruct) {
    // if (endDate !== null) {
    //   this.project.currentPeriods.endDate = this.ngbDateToDate(endDate);
    //   // to set dates, we also need start date
    //   if (this.project.currentPeriods.startDate) {
    //     this.setDates(false, false, true);
    //   }
    // }
  }

  private setDates(start?: boolean, delta?: boolean, end?: boolean) {
    // if (start) {
    //   // when start changes, adjust end accordingly
    //   this.project.currentPeriods.endDate = new Date(this.project.currentPeriods.startDate);
    //   this.project.currentPeriods.endDate.setDate(this.project.currentPeriods.startDate.getDate() + this.delta - 1);
    //   this.endDate = this.dateToNgbDate(this.project.currentPeriods.endDate);

    // } else if (delta) {
    //   // when delta changes, adjust end accordingly
    //   this.project.currentPeriods.endDate = new Date(this.project.currentPeriods.startDate);
    //   this.project.currentPeriods.endDate.setDate(this.project.currentPeriods.startDate.getDate() + this.delta - 1);
    //   this.endDate = this.dateToNgbDate(this.project.currentPeriods.endDate);

    // } else if (end) {
    //   // when end changes, adjust delta accordingly
    //   // use moment to handle Daylight Saving Time changes
    //   this.delta = moment(this.project.currentPeriods.endDate).diff(moment(this.project.currentPeriods.startDate), 'days') + 1;
    // }
  }

  public addDecision() {
    // this.project.decision = new Decision();
  }

  public deleteDecision() {
    // if (this.project.decision) {
    //   // stage decision documents to delete
    //   if (this.project.decision.documents) {
    //     for (const doc of this.project.decision.documents) {
    //       this.deleteDocument(doc, this.project.decision.documents);
    //     }
    //   }

    //   // if decision exists in db, stage it for deletion
    //   if (this.project.decision._id) {
    //     this.decisionToDelete = this.project.decision;
    //   }

    //   this.project.decision = null;
    // }
  }

  // add project or decision documents
  public addDocuments(files: FileList, documents: Document[]) {
    if (files && documents) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list
          if (_.find(documents, doc => (doc.documentFileName === files[i].name))) {
            this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          const formData = new FormData();
          formData.append('displayName', files[i].name);
          formData.append('upfile', files[i]);

          const document = new Document();
          document['formData'] = formData; // temporary
          document.documentFileName = files[i].name;

          // save document for upload to db when project is added or saved
          documents.push(document);
        }
      }
    }
  }

  // delete project or decision document
  public deleteDocument(doc: Document, documents: Document[]) {
    if (doc && documents) { // safety check
      // remove doc from current list
      _.remove(documents, item => (item.documentFileName === doc.documentFileName));

      if (doc._id) {
        // save document for removal from db when project is saved
        this.docsToDelete.push(doc);
      }
    }
  }

  // this is part 1 of adding an project and all its objects
  // (multi-part due to dependencies)
  public addProject() {
    this.isSubmitSaveClicked = true;

    if (this.projectForm.invalid) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Create Project',
          message: 'Please check for required fields or errors.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
      return;
    }

    this.isSubmitting = true;

    // add project
    // this.projectService.add(this.project)
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     project2 => { // onNext
    //       this.addProject2(project2);
    //     },
    //     error => {
    //       this.isSubmitting = false;
    //       console.log('error =', error);
    //       alert('Uh-oh, couldn\'t create project');
    //     }
    //   );
  }

  // this is part 2 of adding an project and all its objects
  // (multi-part due to dependencies)
  private addProject2(project2: Project) {
    let observables = of(null);

    // add all project documents
    // if (this.project.documents) {
    //   for (const doc of this.project.documents) {
    //     doc['formData'].append('_project', project2._id); // set back-reference
    //     observables = observables.concat(this.documentService.add(doc['formData']));
    //   }
    // }

    // add comment period
    // if (this.project.currentPeriods) {
    //   this.project.currentPeriods._project = project2._id; // set back-reference
    //   observables = observables.concat(this.commentPeriodService.add(this.project.currentPeriods));
    // }

    // // add decision
    // if (this.project.decision) {
    //   this.project.decision._project = project2._id; // set back-reference
    //   observables = observables.concat(this.decisionService.add(this.project.decision));
    // }

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isSubmitting = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t add project, part 2');
        },
        () => { // onCompleted
          // reload app with decision for next step
          this.projectService.getById(project2._id, { getDecision: false })
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project3 => {
                this.addProject3(project3);
              },
              error => {
                this.isSubmitting = false;
                console.log('error =', error);
                alert('Uh-oh, couldn\'t reload project, part 2');
              }
            );
        }
      );
  }

  // this is part 3 of adding an project and all its objects
  // (multi-part due to dependencies)
  private addProject3(project3: Project) {
    let observables = of(null);

    // add all decision documents
    // if (this.project.decision && this.project.decision.documents) {
    //   for (const doc of this.project.decision.documents) {
    //     doc['formData'].append('_decision', project3.decision._id); // set back-reference
    //     observables = observables.concat(this.documentService.add(doc['formData']));
    //   }
    // }

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isSubmitting = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t save project, part 3');
        },
        () => { // onCompleted
          // we don't need to reload data since we're navigating away below
          // this.isSubmitting = false; // LOOKS BETTER WITHOUT THIS
          // this.snackBarRef = this.snackBar.open('Project created...', null, { duration: 2000 }); // not displayed due to navigate below

          this.projectForm.form.markAsPristine();
          // if (this.project.documents) {
          //   this.project.documents = []; // negate unsaved document check
          // }
          // if (this.project.decision && this.project.decision.documents) {
          //   this.project.decision.documents = []; // negate unsaved document check
          // }

          // add succeeded --> navigate to details page
          this.router.navigate(['/a', project3._id]);
        }
      );
  }

  // this is part 1 of saving an project and all its objects
  // (multi-part due to dependencies)
  public saveProject() {
    this.isSubmitSaveClicked = true;

    if (this.projectForm.invalid) {
      // if (this.project.isPublished) {
      //   this.dialogService.addDialog(ConfirmComponent,
      //     {
      //       title: 'Cannot Publish Changes',
      //       message: 'Please check for required fields or errors.',
      //       okOnly: true
      //     }, {
      //       backdropColor: 'rgba(0, 0, 0, 0.5)'
      //     })
      //     .takeUntil(this.ngUnsubscribe);
      //   return;
      // } else {
      //   this.dialogService.addDialog(ConfirmComponent,
      //     {
      //       title: 'Cannot Save Project',
      //       message: 'Please check for required fields or errors.',
      //       okOnly: true
      //     }, {
      //       backdropColor: 'rgba(0, 0, 0, 0.5)'
      //     })
      //     .takeUntil(this.ngUnsubscribe);
      //   return;
      // }
    }

    // if (this.project.isPublished && !this.project.description) {
    //   this.dialogService.addDialog(ConfirmComponent,
    //     {
    //       title: 'Cannot Publish Changes',
    //       message: 'A description for this project is required to publish.',
    //       okOnly: true
    //     }, {
    //       backdropColor: 'rgba(0, 0, 0, 0.5)'
    //     })
    //     .takeUntil(this.ngUnsubscribe);
    //   return;
    // }

    this.isSaving = true;

    let observables = of(null);

    // delete staged project and decision documents
    // NB: delete first and add below -- in case the user wants to simultaneously
    //     delete an old doc and add a new doc with the same name
    for (const doc of this.docsToDelete) {
      observables = observables.concat(this.documentService.delete(doc));
    }
    this.docsToDelete = []; // assume delete succeeds

    // // add any new project documents
    // if (this.project.documents) {
    //   for (const doc of this.project.documents) {
    //     if (!doc._id) {
    //       doc['formData'].append('_project', this.project._id); // set back-reference
    //       observables = observables.concat(this.documentService.add(doc['formData']));
    //     }
    //   }
    // }

    // // add/save comment period
    // if (this.project.currentPeriods) {
    //   if (!this.project.currentPeriods._id) {
    //     this.project.currentPeriods._project = this.project._id; // set back-reference
    //     observables = observables.concat(this.commentPeriodService.add(this.project.currentPeriods));
    //   } else {
    //     observables = observables.concat(this.commentPeriodService.save(this.project.currentPeriods));
    //   }
    // }

    // delete staged decision
    // NB: delete first and add below -- in case the user wants to simultaneously
    //     delete an old decision and add a new decision
    if (this.decisionToDelete) {
      observables = observables.concat(this.decisionService.delete(this.decisionToDelete));
    }
    this.decisionToDelete = null; // assume delete succeeds

    // add/save decision
    // if (this.project.decision) {
    //   if (!this.project.decision._id) {
    //     this.project.decision._project = this.project._id; // set back-reference
    //     observables = observables.concat(this.decisionService.add(this.project.decision));
    //   } else {
    //     observables = observables.concat(this.decisionService.save(this.project.decision));
    //   }
    // }

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isSaving = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t save project, part 1');
        },
        () => { // onCompleted
          // reload app with documents, current period and decision for next step
          this.projectService.getById(this.project._id, { getDocuments: true, getCurrentPeriod: true, getDecision: false })
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project2 => {
                this.saveProject2(project2);
              },
              error => {
                this.isSaving = false;
                console.log('error =', error);
                alert('Uh-oh, couldn\'t reload project, part 1');
              }
            );
        }
      );
  }

  // this is part 2 of saving an project and all its objects
  // (multi-part due to dependencies)
  private saveProject2(project2: Project) {
    let observables = of(null);

  //   // auto-publish project documents
  //   if (project2.isPublished && project2.documents) {
  //     for (const doc of project2.documents) {
  //       if (!doc.isPublished) {
  //         observables = observables.concat(this.documentService.publish(doc));
  //       }
  //     }
  //   }

  //   // auto-publish comment period
  //   if (project2.isPublished && project2.currentPeriods) {
  //     if (!project2.currentPeriods.isPublished) {
  //       observables = observables.concat(this.commentPeriodService.publish(project2.currentPeriods));
  //     }
  //   }

  //   // auto-publish decision
  //   if (project2.isPublished && project2.decision) {
  //     if (!project2.decision.isPublished) {
  //       observables = observables.concat(this.decisionService.publish(project2.decision));
  //     }
  //   }

  //   // add any new decision documents
  //   if (this.project.decision && this.project.decision.documents) {
  //     for (const doc of this.project.decision.documents) {
  //       if (!doc._id) {
  //         doc['formData'].append('_decision', project2.decision._id); // set back-reference
  //         observables = observables.concat(this.documentService.add(doc['formData']));
  //       }
  //     }
  //   }

  //   observables
  //     .takeUntil(this.ngUnsubscribe)
  //     .subscribe(
  //       () => { // onNext
  //         // do nothing here - see onCompleted() function below
  //       },
  //       error => {
  //         this.isSaving = false;
  //         console.log('error =', error);
  //         alert('Uh-oh, couldn\'t save project, part 2');
  //       },
  //       () => { // onCompleted
  //         // reload app with decision for next step
  //         this.projectService.getById(project2._id, { getDecision: false })
  //           .takeUntil(this.ngUnsubscribe)
  //           .subscribe(
  //             project3 => {
  //               this.saveProject3(project3);
  //             },
  //             error => {
  //               this.isSaving = false;
  //               console.log('error =', error);
  //               alert('Uh-oh, couldn\'t reload project, part 2');
  //             }
  //           );
  //       }
  //     );
  // }

  // // this is part 3 of saving an project and all its objects
  // // (multi-part due to dependencies)
  // private saveProject3(project3: Project) {
  //   let observables = of(null);

  //   // auto-publish decision documents
  //   if (project3.decision && project3.decision.documents) {
  //     for (const doc of project3.decision.documents) {
  //       if (!doc.isPublished) {
  //         observables = observables.concat(this.documentService.publish(doc));
  //       }
  //     }
  //   }

    // save project
    // observables = observables.concat(this.projectService.save(this.project));

    // observables
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     () => { // onNext
    //       // do nothing here - see onCompleted() function below
    //     },
    //     error => {
    //       this.isSaving = false;
    //       console.log('error =', error);
    //       alert('Uh-oh, couldn\'t save project, part 3');
    //     },
    //     () => { // onCompleted
    //       // we don't need to reload data since we're navigating away below
    //       // this.isSaving = false; // LOOKS BETTER WITHOUT THIS
    //       // this.snackBarRef = this.snackBar.open('Project saved...', null, { duration: 2000 }); // not displayed due to navigate below

    //       this.projectForm.form.markAsPristine();

    //       if (this.project.documents) {
    //         for (const doc of this.project.documents) {
    //           // assign 'arbitrary' id to docs so that:
    //           // 1) unsaved document check passes
    //           // 2) page doesn't jump around
    //           doc._id = '0';
    //         }
    //       }

    //       if (this.project.decision && this.project.decision.documents) {
    //         for (const doc of this.project.decision.documents) {
    //           // assign 'arbitrary' id to docs so that:
    //           // 1) unsaved document check passes
    //           // 2) page doesn't jump around
    //           doc._id = '0';
    //         }
    //       }

    //       // save succeeded --> navigate to details page
    //       this.router.navigate(['/a', project3._id]);
    //     }
    //   );
  }

}
