import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';
import { MatSnackBar } from '@angular/material';

import { ConfigService } from 'app/services/config.service';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';

import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private readonly SNACKBAR_TIMEOUT = 1500;

  public documents: any[] = [];
  public currentProject;
  public myForm: FormGroup;
  public doctypes: any[] = [];
  public filteredDoctypes2002: any[] = [];
  public filteredDoctypes2018: any[] = [];
  public authors: any[] = [];
  public filteredAuthors2002: any[] = [];
  public filteredAuthors2018: any[] = [];
  public labels: any[] = [];
  public filteredLabels2002: any[] = [];
  public filteredLabels2018: any[] = [];
  public datePosted: NgbDateStruct = null;
  public isPublished = false;
  public loading = true;
  public multiEdit = false;
  public docNameInvalid = false;
  public projectPhases: any[] = [];
  public filteredProjectPhases2002: any[] = [];
  public filteredProjectPhases2018: any[] = [];

  public legislationYear = '1996';

  constructor(
    private config: ConfigService,
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private router: Router,
    private storageService: StorageService,
    private utils: Utils
  ) { }

  ngOnInit() {
    this.documents = this.storageService.state.selectedDocs;
    this.currentProject = this.storageService.state.currentProject.data;

    // Check if documents are null (nav straight to this page)
    if (!this.documents || this.documents.length === 0) {
      this.router.navigate(['p', this.currentProject._id, 'project-documents']);
    } else {
      this.legislationYear = this.documents[0].legislation ? this.documents[0].legislation.toString() : this.legislationYear;
      this.buildForm();
      this.getLists();
    }
  }

  buildForm() {
    this.myForm = new FormGroup({
      'docLegislationRadio': new FormControl(this.legislationYear),
      'doctypesel': new FormControl(),
      'authorsel': new FormControl(),
      'labelsel': new FormControl(),
      'datePosted': new FormControl(),
      'displayName': new FormControl(),
      'description': new FormControl(),
      'projectphasesel': new FormControl()
    });
  }

  getLists() {
    // todo: check if the lists are cashed here, if the are don't subscribe
    this.config.getLists().subscribe (lists => {
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

      // todo: cache these lists here

      this.populateForm();
    });
  }

  populateForm() {
    this.filterByLegislationYear();

    if (this.documents.length === 1) {
      // todo: figure out publish see barakas code
      this.isPublished = this.documents[0].read.includes('public');

      // Set the old data in there if it exists.
      if (this.documents[0].type) {this.myForm.controls.doctypesel.setValue(this.documents[0].type); }
      if (this.documents[0].documentAuthorType) {this.myForm.controls.authorsel.setValue(this.documents[0].documentAuthorType); }
      if (this.documents[0].milestone) {this.myForm.controls.labelsel.setValue(this.documents[0].milestone); }
      if (this.documents[0].datePosted) {this.myForm.controls.datePosted.setValue(this.utils.convertJSDateToNGBDate(new Date(this.documents[0].datePosted))); }
      if (this.documents[0].displayName) {this.myForm.controls.displayName.setValue(this.documents[0].displayName); }
      if (this.documents[0].description) {this.myForm.controls.description.setValue(this.documents[0].description); }
      if (this.documents[0].projectPhase) {this.myForm.controls.projectphasesel.setValue(this.documents[0].projectPhase); }

      // init docNameInvalid
      this.validateChars();
    } else {
      this.multiEdit = true;
    }
    if (this.storageService.state.labels) {
      // this.labels = this.storageService.state.labels;
    }
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

  goBack() {
    if (this.storageService.state.back && this.storageService.state.back.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/p', this.currentProject._id, 'project-documents']);
    }
  }

  public validateChars() {
    if (this.myForm.value.displayName && this.myForm.value.displayName.match(/[\/|\\:*?"<>]/g)) {
      this.docNameInvalid = true;
    } else {
      this.docNameInvalid = false;
    }
  }

  // on multi edit save, check if form fields have a value
  multiEditGetUpdatedValue(formValue: string | NgbDate, docValue, isDate = false) {
    if (formValue !== null) {
      if (isDate) {
        return new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(formValue))).toISOString();
      } else {
        return formValue;
      }
    } else {
      return docValue;
    }
  }

  applyChangesIfAny(formData: FormData, fieldName: string, formValue: string | NgbDate, docValue, isDate: boolean = false): void {
    const value = this.multiEditGetUpdatedValue(formValue, docValue, isDate);
    if (value) {
      formData.append(fieldName, value);
    }
  }

  save() {
    this.loading = true;

    // Save all the elements to all the documents.
    console.log('this.myForm:', this.myForm);
    // go through and upload one at a time.
    let observables = [];

    let theLabels = this.labels.filter(label => {
      return label.selected === true;
    });

    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('project', this.currentProject._id);
      formData.append('documentSource', 'PROJECT');

      if (!this.multiEdit) {
        if (doc.documentFileName) {formData.append('documentFileName', doc.documentFileName); }
        if (this.myForm.value.description) {formData.append('description', this.myForm.value.description); }
        if (this.myForm.value.displayName) {formData.append('displayName', this.myForm.value.displayName); }

        formData.append('milestone', this.myForm.value.labelsel);
        formData.append('datePosted', new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('datePosted').value))).toISOString());
        formData.append('type', this.myForm.value.doctypesel);
        formData.append('documentAuthorType', this.myForm.value.authorsel);
        formData.append('projectPhase', this.myForm.value.projectphasesel);
      } else {
        this.applyChangesIfAny(formData, 'documentFileName', null, doc.documentFileName);
        this.applyChangesIfAny(formData, 'displayName', null, doc.displayName);
        this.applyChangesIfAny(formData, 'description', null, doc.description);
        this.applyChangesIfAny(formData, 'type', this.myForm.value.doctypesel, doc.type);
        this.applyChangesIfAny(formData, 'documentAuthorType', this.myForm.value.authorsel, doc.documentAuthorType);
        this.applyChangesIfAny(formData, 'milestone', this.myForm.value.labelsel, doc.milestone);
        this.applyChangesIfAny(formData, 'projectPhase', this.myForm.value.projectphasesel, doc.projectPhase);
        this.applyChangesIfAny(formData, 'datePosted', this.myForm.value.datePosted, doc.datePosted, true);
      }

      // TODO
      formData.append('labels', JSON.stringify(theLabels));
      formData.append('legislation', this.legislationYear);
      observables.push(this.documentService.update(formData, doc._id));
    });

    // multi edit should not be set to false
    // it caused a bug where extra fields show up after saving, and could null out document names
    // this.multiEdit = false;

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };
    this.storageService.state = { type: 'labels', data: null };

    forkJoin(observables)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (d) => { // onNext
          // Push the new version of documents into the selected list.
          this.storageService.state.selectedDocs = d;
        },
        error => {
          const message = (error.error && error.error.message) ? error.error.message : 'Could not upload document';
          this.snackBar.open(message, 'Close', { duration: this.SNACKBAR_TIMEOUT});
          this.loading = false;
        },
        () => { // onCompleted
          // Set new state for docs.
          this.storageService.state = { type: 'documents', data: this.storageService.state.selectedDocs };
          // Clear out the document state that was stored previously.
          this.goBack();
          // this.loading should not be turned off at all in this function.
          // its important that the spinner stays on until we navigate away from this page
          // this.loading = false;
        }
      );
  }

  addLabels() {
    console.log('Adding labels');
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'labels', data: this.labels };
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-documents', 'edit'], label: 'Edit Document(s)' };
    this.router.navigate(['/p', this.currentProject._id, 'project-documents', 'edit', 'add-label']);
  }

  public togglePublish() {
    this.isPublished = !this.isPublished;
    let observables = [];
    this.documents.map(doc => {
      if (this.isPublished) {
        observables.push(this.documentService.publish(doc._id));
      } else {
        observables.push(this.documentService.unPublish(doc._id));
      }
      forkJoin(observables)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { // onNext
            // do nothing here - see onCompleted() function below
          },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t update document\'s publish status');
            // TODO: should fully reload project here so we have latest non-deleted objects
          },
          () => { // onCompleted

            this.save();

            if (this.isPublished) {
              this.openSnackBar('This document has been published.', 'Close');
            } else {
              this.openSnackBar('This document has been unpublished.', 'Close');
            }
          }
        );
    });
  }

  register(myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
