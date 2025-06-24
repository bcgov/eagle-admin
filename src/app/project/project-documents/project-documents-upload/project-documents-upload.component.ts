import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import * as moment from 'moment-timezone';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';
import { Document } from 'src/app/models/document';

@Component({
  selector: 'app-project-documents-upload',
  templateUrl: './project-documents-upload.component.html',
  styleUrls: ['./project-documents-upload.component.scss']
})
export class ProjectDocumentsUploadComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public authorsel: any;
  public currentProject;
  public projectFiles: Array<File> = [];
  public documents: Document[] = [];
  public filteredDoctypes2002: any[] = [];
  public filteredDoctypes2018: any[] = [];
  public authors: any[] = [];
  public filteredAuthors2002: any[] = [];
  public filteredAuthors2018: any[] = [];
  public labels: any[] = [];
  public filteredLabels2002: any[] = [];
  public filteredLabels2018: any[] = [];
  public datePosted: NgbDateStruct = null;
  public dateUploaded: NgbDateStruct = null;
  public doctypes: any[] = [];
  public milestones: any[] = [];  // Get this from the project's data.
  public myForm: UntypedFormGroup;
  public loading = true;
  public docNameInvalid = false;
  public projectPhases: any[] = [];
  public filteredProjectPhases2002: any[] = [];
  public filteredProjectPhases2018: any[] = [];
  public legislationYear = '2018';
  public publishDoc = false;
  public snackBarTimeout = 1500;

  constructor(
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
    private utils: Utils,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.buildForm();
    this.getLists();
  }

  buildForm() {
    this.myForm = new UntypedFormGroup({
      'docLegislationRadio': new UntypedFormControl(this.legislationYear),
      'doctypesel': new UntypedFormControl(),
      'authorsel': new UntypedFormControl(),
      'labelsel': new UntypedFormControl(),
      'datePosted': new UntypedFormControl(),
      'dateUploaded': new UntypedFormControl(),
      'displayName': new UntypedFormControl(),
      'description': new UntypedFormControl(),
      'projectphasesel': new UntypedFormControl()
    });
    const today = new Date();
    const todayObj = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
    this.myForm.controls.datePosted.setValue(todayObj);
    this.myForm.controls.dateUploaded.setValue(todayObj);
  }

  getLists() {
    this.configService.lists.forEach(item => {
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
    this.populateForm();
  }

  populateForm() {
    this.filterByLegislationYear();
    this.loading = false;
  }

  filterByLegislationYear() {
    // only have lists for 2002,2018. 2002 list is equivalent to 1996 for now
    this.filteredDoctypes2002 = this.doctypes.filter(item => item.legislation === 2002);
    this.filteredDoctypes2002.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);
    this.filteredAuthors2002 = this.authors.filter(item => item.legislation === 2002);
    this.filteredLabels2002 = this.labels.filter(item => item.legislation === 2002);
    this.filteredLabels2002.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);
    this.filteredProjectPhases2002 = this.projectPhases.filter(item => item.legislation === 2002);
    this.filteredProjectPhases2002.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);

    this.filteredDoctypes2018 = this.doctypes.filter(item => item.legislation === 2018);
    this.filteredDoctypes2018.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);
    this.filteredAuthors2018 = this.authors.filter(item => item.legislation === 2018);
    this.filteredLabels2018 = this.labels.filter(item => item.legislation === 2018);
    this.filteredLabels2018.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);
    this.filteredProjectPhases2018 = this.projectPhases.filter(item => item.legislation === 2018);
    this.filteredProjectPhases2018.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);
  }

  public changeLegislation (event) {
    this.legislationYear = event.target.value;

    this.myForm.controls.doctypesel.setValue(null);
    this.myForm.controls.authorsel.setValue(null);
    this.myForm.controls.labelsel.setValue(null);
    this.myForm.controls.projectphasesel.setValue(null);
  }

  addLabels() {
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'documents', data: this.documents };
    this.storageService.state = { type: 'labels', data: this.labels };
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-documents', 'upload'], label: 'Upload Document(s)' };
    this.router.navigate(['/p', this.currentProject._id, 'project-documents', 'upload', 'add-label']);
  }

  register(myForm: UntypedFormGroup) {
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
    const observables = [];

    // NB: If multi upload, then switch to use documentFileName as displayName

    this.documents.forEach(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);

      formData.append('documentFileName', doc.documentFileName);

      formData.append('documentSource', 'PROJECT');

      formData.append('displayName', this.documents.length > 1 ? doc.documentFileName : this.myForm.value.displayName);
      formData.append('milestone', this.myForm.value.labelsel);
      formData.append('dateUploaded', moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateUploaded').value)).toDate().toISOString());
      formData.append('datePosted', moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('datePosted').value)).toDate().toISOString());
      formData.append('type', this.myForm.value.doctypesel);
      formData.append('description', this.myForm.value.description);
      formData.append('documentAuthorType', this.myForm.value.authorsel);
      formData.append('projectPhase', this.myForm.value.projectphasesel);
      formData.append('legislation', this.legislationYear);
      observables.push(this.documentService.add(formData, this.publishDoc));
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
          // Add in api error message
          const message = (error.error && error.error.message) ? error.error.message : 'Could not upload document';
          this.snackBar.open(message, 'Close', { duration: this.snackBarTimeout});
          this.loading = false;
          // TODO: should fully reload project here so we have latest non-deleted objects
        },
        () => { // onCompleted
          // delete succeeded --> navigate back to search
          // Clear out the document state that was stored previously.
          this.snackBar.open('Uploaded Successfully!', 'Close', { duration: this.snackBarTimeout});
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
      this.router.navigate(['/p', this.currentProject._id, 'project-documents']);
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
