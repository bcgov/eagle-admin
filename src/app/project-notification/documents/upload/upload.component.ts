import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, of, forkJoin } from 'rxjs';
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
      'displayName': new FormControl()
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

    // NB: If multi upload, then switch to use documentFileName as displayName

    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('documentSource', 'PROJECT-NOTIFICATION');
      formData.append('displayName', this.documents.length > 1 ? doc.documentFileName : this.myForm.value.displayName);
      formData.append('dateUploaded', new Date().toISOString());
      formData.append('datePosted', new Date().toISOString());
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
          alert('Uh-oh, couldn\'t delete project');
          // TODO: should fully reload project here so we have latest non-deleted objects
        },
        () => { // onCompleted
          // delete succeeded --> navigate back to search
          // Clear out the document state that was stored previously.
          this.router.navigate(['p', this.currentProject._id, 'project-documents']);
          this.loading = false;
        }
      );
  }

public docNameExists() {
  // Doc name "exists" if the form has a value, or if the form has more than one document
  // this does not check name validity (validateChars does that)
  return (this.myForm.value.displayName && this.myForm.value.displayName.length > 0) ||
         (this.documents && this.documents.length > 1);
}

  public validateChars() {
    if (this.myForm.value.displayName.match(/[\/|\\:*?"<>]/g)) {
      this.docNameInvalid = true;
    } else {
      this.docNameInvalid = false;
    }
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
