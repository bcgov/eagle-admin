import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Document } from 'app/models/document';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { ConfigService } from 'app/services/config.service';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public currentProjectId: string;
  public authorsel: any;
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

  constructor(
    private router: Router,
    private storageService: StorageService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private config: ConfigService
  ) { }

  ngOnInit() {
    this.route.parent.paramMap.subscribe(params => {
      this.currentProjectId = params.get('projId');
    });
    this.config.lists.map(item => {
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
      }
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
        'description': new FormControl()
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
  }

  addLabels() {
    console.log('Adding labels');
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'documents', data: this.documents };
    this.storageService.state = { type: 'labels', data: this.labels };
    this.storageService.state.back = { url: ['/p', this.currentProjectId, 'project-documents', 'upload'], label: 'Upload Document(s)'};
    this.router.navigate(['/p', this.currentProjectId, 'project-documents', 'upload', 'add-label']);
  }

  register (myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  public uploadDocuments() {
    this.loading = true;

    // go through and upload one at a time.
    let observables = of(null);

    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProjectId);

      formData.append('documentFileName', doc.documentFileName);

      formData.append('documentSource', 'PROJECT');

      formData.append('displayName', this.myForm.value.displayName);
      formData.append('milestone', this.myForm.value.labelsel);
      formData.append('dateUploaded', moment(this.myForm.value.dateUploaded));
      formData.append('datePosted', moment(this.myForm.value.datePosted));
      formData.append('type', this.myForm.value.doctypesel);
      formData.append('description', this.myForm.value.description);
      formData.append('documentAuthor', this.myForm.value.authorsel);
      observables = observables.concat(this.documentService.add(formData));
    });

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };
    this.storageService.state = { type: 'labels', data: null };

    observables
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
          this.router.navigate(['p', this.currentProjectId, 'project-documents']);
          this.loading = false;
        }
      );
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
  }

  public deleteDocument(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.projectFiles = this.projectFiles.filter(item => (item.name !== doc.documentFileName));
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

}
