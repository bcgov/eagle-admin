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
import { SearchService } from 'app/services/search.service';
import { ISearchResults } from 'app/models/search';
import { Utils } from 'app/shared/utils/utils';

import { FullProject } from 'app/models/fullProject';
import { yearsPerPage } from '@angular/material/datepicker/typings/multi-year-view';
import { TransitiveCompileNgModuleMetadata } from '@angular/compiler';
import { endianness } from 'os';


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

  public oldProject: Project;
  public fullProject: FullProject;
  public currentLegYear: number;
  public showArchivedButton = false;
  public legislationYearList;

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
    private searchService: SearchService,
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
            this.currentLegYear = this.project.legislationYear;
            this.isPublished = this.project.read.includes('public');
            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
            // this.loading = false;
            this._changeDetectorRef.detectChanges();
            console.log("Project - this.project")
            console.log(this.project);
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );

/*
export class FullProject {
  _id: string;
  currentLegislationYear: string;
  legislationYearList: number[];
  legislation_1996: Project;
  legislation_2002: Project;
  legislation_2018: Project;
}


*/

    // Get data related to current project
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: { fullProject: ISearchResults<FullProject>[] }) => {
        this.legislationYearList = data.fullProject[0].data.searchResults[0].legislationYearList;
        console.log(this.legislationYearList);
        console.log("Full Project")
        console.log(data.fullProject[0].data.searchResults[0].currentLegislationYear);
        console.log(data.fullProject[0].data.searchResults[0]);
        // console.log("Legislation array list length")
        // console.log(this.legislationYearList.length);
        try {
          this._changeDetectorRef.detectChanges();
        } catch (e) {
          // console.log('e:', e);
        }
      });

      this.checkShowButton();
  }

  // initFull(data: { fullProject: ISearchResults<FullProject>[] }) {
  //   const fullProjectSearchData = this.utils.extractFromSearchResults(data.fullProject);
  //   this.fullProject = fullProjectSearchData ? fullProjectSearchData[0] : null;
  //   if (this.fullProject) {
  //     this.oldProject = this.fullProject['legislation_2002'] || this.fullProject['legislation_1996'];
  //     this.project = this.fullProject['legislation_2018'];
  //     this.publishedLegislation =  this.fullProject.currentLegislationYear.toString();
  //     this.projectId = this.fullProject._id;
  //     this.projectName = this.tabIsEditing ? this.project.name : this.storageService.state.projectDetailName;
  //   } else {
  //     this.pageIsEditing = false;
  //     this.tabIsEditing = false;
  //   }

  // }

  checkShowButton() {
    // if length = 1, showArchivedButton = false

    this.showArchivedButton = false;

    if ( this.legislationYearList.length === 1){
      this.showArchivedButton = false;
    } else if ( this.legislationYearList.some( (el) => el < this.currentLegYear) ) {
      // If there is any legislation earlier than the currentLegYear
      this.showArchivedButton = true;
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
    this.router.navigate(['p', this.project._id, 'edit', {1996: 'form-2002', 2002: 'form-2002', 2018: 'form-2018'}[this.project.legislationYear]]);
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
          this.projectService.getById(this.project._id)
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
