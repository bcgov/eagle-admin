import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';

import { Document } from 'app/models/document';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public currentProject;
  public projectFiles: Array<File> = [];
  public documents: Document[] = [];
  public datePosted: NgbDateStruct = null;
  public dateUploaded: NgbDateStruct = null;
  public myForm: FormGroup;
  public loading = true;
  public docNameInvalid = false;
  public legislationYear = '2018';
  public publishDoc = false;
  public documentLabel = ["Proponent Project Notification", "EAO Project Notification Report"];
  public documentType = ["Project Notification", "Decision Materials"];
  public documentMilestone = ["Project Notification"];
  public documentAuthor = ["Proponent", "EAO"];
  public documentPhase = [ "Project Designation"];



  constructor(
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.buildForm();
  }

  buildForm() {
    this.myForm = new FormGroup({
      'displayName': new FormControl(),
      'description': new FormControl(),
      'label': new FormControl(this.documentLabel[0]),
      'type' : new FormControl({value: this.documentType[0], disabled: true}),
      'milestone' : new FormControl({ value: this.documentMilestone[0], disabled: true}),
      'author' : new FormControl( { value: this.documentAuthor[0] , disabled: true }),
      'phase' : new FormControl({ value: this.documentPhase[0], disabled: true } )
    });
    this.loading = false;
  }

  populateForm() {
    this.loading = false;
  }

  register(myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  public uploadAndPublish() {
    this.publishDoc = true;
    this.uploadDocuments();
  }

  public uploadDocuments() {
    this.loading = true;

    // go through and upload one at a time.
    let observables = [];

    this.documents.map(doc => {
      const formData = new FormData();

      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('documentSource', 'PROJECT-NOTIFICATION');
      formData.append('displayName', doc.documentFileName );
      formData.append('dateUploaded', new Date().toISOString());
      formData.append('datePosted', new Date().toISOString());
      formData.append('milestone', this.myForm.value.milestone);
      formData.append('type', this.myForm.value.type);
      formData.append('description', 'Project Notification Document');
      formData.append('documentAuthorType', this.myForm.value.documentAuthorType);
      formData.append('projectPhase', this.myForm.value.projectPhase);
      formData.append('legislation', '2018');

      observables.push(this.documentService.add(formData, this.publishDoc));
    });

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };

    forkJoin(observables)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          console.log('error =', error);
          alert('Document upload failed due to a service error.');
          this.router.navigate(['pn', this.currentProject._id, 'project-notification-documents']);
          this.loading = false;
        },
        () => { // onCompleted
          // delete succeeded --> navigate back to search
          // Clear out the document state that was stored previously.
          this.router.navigate(['pn', this.currentProject._id, 'project-notification-documents']);
          this.loading = false;
        }
      );
  }



  

  public addDocuments(files: FileList) {
    if (this.documents.length === 2) {
      this.snackBar.open('Project Notifications can have a maximum of 2 files', null, {
        duration: 2000,
      });
      return false;
    }

    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list

          if (this.documents.find(x => x.documentFileName === files[i].name)) {
            // this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          this.projectFiles.push(files[i]);

          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;
          document.legislation = 2018;

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }

      if (this.documents && this.documents.length > 1) {
        this.docNameInvalid = false;
      }
    }
    this._changeDetectionRef.detectChanges();
  }

  goBack() {
    if (this.storageService.state.back && this.storageService.state.back.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/pn', this.currentProject._id, 'project-notification-documents;notificationProjectId=' + this.currentProject._id]);
    }
  }

  public deleteDocument(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.projectFiles = this.projectFiles.filter(item => (item.name !== doc.documentFileName));
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

  public onChangeLabel(){
    if (this.myForm.value.label ===  "Proponent Project Notification"){
      this.myForm.controls.type.setValue(this.documentType[0]);
      this.myForm.controls.author.setValue(this.documentAuthor[0]);
      this.myForm.controls.milestone.setValue(this.documentMilestone[0]);
      this.myForm.controls.phase.setValue(this.documentPhase[0]);
    } 
    else if (this.myForm.value.label === "EAO Project Notification Report"){
      this.myForm.controls.type.setValue(this.documentType[1]);
      this.myForm.controls.author.setValue(this.documentAuthor[1]);
      this.myForm.controls.milestone.setValue(this.documentMilestone[0]);
      this.myForm.controls.phase.setValue(this.documentPhase[0]);
    }
    this._changeDetectionRef.detectChanges();
    
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
