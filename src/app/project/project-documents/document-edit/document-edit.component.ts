import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl  } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { of, forkJoin } from 'rxjs';
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
export class DocumentEditComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: any[] = [];
  public currentProject;
  public myForm: FormGroup;
  public doctypes: any[] = [];
  public authors: any[] = [];
  public labels: any[] = [];
  public datePosted: NgbDateStruct = null;
  public dateUploaded: NgbDateStruct = null;
  public isPublished = false;
  public loading = true;
  public multiEdit = false;

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
        if (this.documents.length === 1) {
          this.isPublished = this.documents[0].read.includes('public');
          // Set the old data in there if it exists.
          this.myForm = new FormGroup({
            'doctypesel': new FormControl(this.documents[0].type),
            'authorsel': new FormControl(this.documents[0].documentAuthor),
            'labelsel': new FormControl(this.documents[0].milestone),
            'datePosted': new FormControl(this.utils.convertJSDateToNGBDate(new Date(this.documents[0].datePosted))),
            'dateUploaded': new FormControl(this.utils.convertJSDateToNGBDate(new Date(this.documents[0].dateUploaded))),
            'displayName': new FormControl(this.documents[0].displayName),
            'description': new FormControl(this.documents[0].description),
          });
        } else {
          this.multiEdit = true;
          this.myForm = new FormGroup({
            'doctypesel': new FormControl(),
            'authorsel': new FormControl(),
            'labelsel': new FormControl(),
            'datePosted': new FormControl(),
            'dateUploaded': new FormControl(),
            'displayName': new FormControl(),
            'description': new FormControl(),
          });
        }
      }

      if (this.storageService.state.labels) {
        // this.labels = this.storageService.state.labels;
      }
    }
    this.loading = false;
  }

  goBack() {
    if (this.storageService.state.back && this.storageService.state.back.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/p', this.currentProject._id, 'project-documents']);
    }
  }

  // on multi edit save, check if form fields have a value
  multiEditGetUpdatedValue(formValue, docValue, isDate = false) {
    if ( formValue !== null ) {
      if ( isDate ) {
        return new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(formValue))).toISOString();
      } else {
        return formValue;
      }
    } else {
      return docValue;
    }
  }

  save() {
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
        doc.documentFileName !== null ? formData.append('documentFileName', doc.documentFileName) : Function.prototype;
        this.myForm.value.description !== null ? formData.append('description', this.myForm.value.description) : Function.prototype;
        this.myForm.value.displayName !== null ? formData.append('displayName', this.myForm.value.displayName) : Function.prototype;
        formData.append('milestone', this.myForm.value.labelsel);
        formData.append('dateUploaded', new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateUploaded').value))).toISOString());
        formData.append('datePosted', new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('datePosted').value))).toISOString());
        formData.append('type', this.myForm.value.doctypesel);
        formData.append('documentAuthor', this.myForm.value.authorsel);
      } else {
        doc.documentFileName !== null ? formData.append('documentFileName', doc.documentFileName) : Function.prototype;
        doc.displayName !== null ? formData.append('displayName', doc.displayName) : Function.prototype;
        doc.description !== null ? formData.append('description', doc.description) : Function.prototype;

        // apply changes to milestone if any
        let milestone = this.multiEditGetUpdatedValue(this.myForm.value.labelsel, doc.milestone);
        milestone !== undefined && milestone !== null ? formData.append('milestone', milestone) : Function.prototype;

        // apply changes to dateUploaded if any
        let dateUploaded = this.multiEditGetUpdatedValue(this.myForm.value.dateUploaded, doc.dateUploaded, true);
        dateUploaded !== undefined && dateUploaded !== null ? formData.append('dateUploaded', dateUploaded) : Function.prototype;

        // apply changes to datePosted if any
        let datePosted = this.multiEditGetUpdatedValue(this.myForm.value.datePosted, doc.datePosted, true);
        datePosted !== undefined && datePosted !== null ? formData.append('datePosted', datePosted) : Function.prototype;

        // apply changes to type if any
        let type = this.multiEditGetUpdatedValue(this.myForm.value.doctypesel, doc.type);
        type !== undefined && type !== null ? formData.append('type', type) : Function.prototype;

        // apply changes to documentAuthor if any
        let documentAuthor = this.multiEditGetUpdatedValue(this.myForm.value.authorsel, doc.documentAuthor);
        documentAuthor !== undefined && documentAuthor !== null ? formData.append('documentAuthor', documentAuthor) : Function.prototype;
      }

      // TODO
      formData.append('labels', JSON.stringify(theLabels));
      observables.push(this.documentService.update(formData, doc._id));
    });

    this.multiEdit = false;
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
          this.goBack();
          this.loading = false;
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
}
