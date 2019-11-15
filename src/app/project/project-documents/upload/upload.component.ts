import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, of, forkJoin } from 'rxjs';
import * as moment from 'moment-timezone';

import { ConfigService } from 'app/services/config.service';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';

import { Document } from 'app/models/document';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public authorsel: any;
  public currentProject;
  public projectFiles: Array<File> = [];
  public documents: Document[] = [];
  public datePosted: NgbDateStruct = null;
  public dateUploaded: NgbDateStruct = null;
  public doctypes: any[] = [];
  public authors: any[] = [];
  public labels: any[] = [];
  public milestones: any[] = [];  // Get this from the project's data.
  public myForm: FormGroup;
  public loading = true;
  public docNameInvalid = false;
  public projectPhases: any[] = [];

  constructor(
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private documentService: DocumentService,
    private utils: Utils,
    private config: ConfigService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.config.getLists().subscribe(lists => {
      lists.map(item => {
        switch (item.type) {
          case 'doctype':
            this.doctypes.push(Object.assign({}, item));
            break;
          case 'author':
            this.authors.push(Object.assign({}, item));
            break;
          case 'label':
            this.labels.push(Object.assign({}, item));
            break;
          case 'projectPhase':
            this.projectPhases.push(Object.assign({}, item));
            break;
        }
      });
    });

    if (this.storageService.state.form) {
      this.myForm = this.storageService.state.form;
    } else {
      this.myForm = new FormGroup({
        'doctypesel': new FormControl(),
        'authorsel': new FormControl(),
        'labelsel': new FormControl(),
        'datePosted': new FormControl(),
        'dateUploaded': new FormControl(),
        'displayName': new FormControl(),
        'description': new FormControl(),
        'projectphasesel': new FormControl()
      });
      let today = new Date();
      let todayObj = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
      };
      this.myForm.controls.datePosted.setValue(todayObj);
      this.myForm.controls.dateUploaded.setValue(todayObj);
    }

    if (this.storageService.state.documents) {
      this.documents = this.storageService.state.documents;
    }

    if (this.storageService.state.labels) {
      this.labels = this.storageService.state.labels;
    }
    this.loading = false;
    this._changeDetectionRef.detectChanges();
  }

  addLabels() {
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'documents', data: this.documents };
    this.storageService.state = { type: 'labels', data: this.labels };
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-documents', 'upload'], label: 'Upload Document(s)' };
    this.router.navigate(['/p', this.currentProject._id, 'project-documents', 'upload', 'add-label']);
  }

  register(myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
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

      formData.append('documentSource', 'PROJECT');

      formData.append('displayName', this.documents.length > 1 ? doc.documentFileName : this.myForm.value.displayName);
      formData.append('milestone', this.myForm.value.labelsel);
      formData.append('dateUploaded', new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateUploaded').value))).toISOString());
      formData.append('datePosted', new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('datePosted').value))).toISOString());
      formData.append('type', this.myForm.value.doctypesel);
      formData.append('description', this.myForm.value.description);
      formData.append('documentAuthorType', this.myForm.value.authorsel);
      formData.append('projectPhase', this.myForm.value.projectphasesel);
      observables.push(this.documentService.add(formData));
    });

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };
    this.storageService.state = { type: 'labels', data: null };

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

  public validateChars() {
    if (this.myForm.value.displayName.match(/[\/|\\:*?"<>]/g)) {
      this.docNameInvalid = true;
    } else {
      this.docNameInvalid = false;
    }
  }

  public addDocuments(files: FileList) {
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

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
    }
    this._changeDetectionRef.detectChanges();
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
