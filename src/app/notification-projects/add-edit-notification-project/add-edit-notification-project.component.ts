import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { map } from 'rxjs/operators';
import { Subject, forkJoin } from 'rxjs';
import * as moment from 'moment-timezone';

import { Document } from 'app/models/document';
import { DocumentService } from 'app/services/document.service';
import { NotificationProject } from 'app/models/notificationProject';

import { ConfigService } from 'app/services/config.service';
import { Constants } from 'app/shared/utils/constants';
import { NotificationProjectService } from 'app/services/notification-project.service';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-add-edit-notification-project',
  templateUrl: './add-edit-notification-project.component.html',
  styleUrls: ['./add-edit-notification-project.component.scss']
})

export class AddEditNotificationProjectComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isEditing = false;
  public isPublished = false;
  public loading = false;
  public myForm: FormGroup;
  public notificationProject = null;
  public notificationProjectId = '';
  public regions: any[] = [];
  public subTypeSelected = [];

  // Raw files coming in from file uploader
  public newFiles: Array<File> = [];

  // Array that contains the files after they've been converted into Documents
  public newDocuments: Document[] = [];

  // On an edit, these are the existing documents
  public existingDocuments: Document[] = [];

  // On an edit, these are the documents we are going to delete
  public documentsToDelete = [];

  public PROJECT_SUBTYPES: Object = Constants.PROJECT_SUBTYPES(2018);
  public PROJECT_TYPES: Array<Object> = Constants.PROJECT_TYPES(2018);

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private config: ConfigService,
    private documentService: DocumentService,
    private notificationProjectService: NotificationProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private utils: Utils
  ) { }

  public ngOnInit() {
    this.config.getRegions()
      .subscribe(regions => {
        this.regions = regions;
      });
    this._changeDetectorRef.detectChanges();

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        this.isEditing = Object.keys(res).length === 0 && res.constructor === Object ? false : true;
        this.notificationProjectId = this.isEditing ? res.notificationProject.data._id : '';

        if (!this.isEditing) {
          this.buildForm({
            'name': '',
            'type': '',
            'subType': '',
            'proponentName': '',
            'startDate': '',
            'decisionDate': '',
            'region': '',
            'notificationDecision': '',
            'description': '',
            'centroid': ['', '']
          });
        } else {
          this.notificationProject = res.notificationProject.data;
          this.existingDocuments = res.documents[0].data.searchResults;
          if (this.notificationProject.read.includes('public')) {
            this.isPublished = true;
          }
          let editData = { ...res.notificationProject.data };
          editData.startDate = this.utils.convertJSDateToNGBDate(new Date(res.notificationProject.data.startDate));
          editData.decisionDate = this.utils.convertJSDateToNGBDate(new Date(res.notificationProject.data.decisionDate));
          this.buildForm(editData);
          this.subTypeSelected = this.PROJECT_SUBTYPES[this.myForm.controls.type.value];
        }
        this.loading = false;
        this._changeDetectorRef.detectChanges();
      });
  }

  public onSubmit(publish) {
    if (!this.validateForm()) {
      return;
    }

    let saveOnly = false;
    if (publish == null) {
      saveOnly = true;
    }

    if (publish == null && this.isPublished) {
      publish = true;
    } else if (publish == null && !this.isPublished) {
      publish = false;
    }
    let notificationProject = new NotificationProject({
      name: this.myForm.controls.name.value,
      type: this.myForm.controls.type.value,
      subType: this.myForm.controls.subType.value,
      proponentName: this.myForm.controls.proponentName.value,
      startDate: this.myForm.get('startDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('startDate').value))).toISOString() : null,
      decisionDate: this.myForm.get('decisionDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('decisionDate').value))).toISOString() : null,
      region: this.myForm.controls.region.value,
      notificationDecision: this.myForm.controls.notificationDecision.value,
      description: this.myForm.controls.description.value,
      centroid: [this.myForm.controls.longitude.value, this.myForm.controls.latitude.value]
    });

    let observables = [];

    if (!this.isEditing) {
      this.notificationProjectService.add(notificationProject, publish)
        .pipe(
          // We do this pipe because we need to make sure that we create the notification project before submitting the documents.
          // Documents require notification project's ID.
          map(np => {
            // Set document IDs to the newly created notification project's (variable np) ID.
            let documentForms = this.setDocumentForm(np._id);
            observables = documentForms.map(documentForm => {
              // If we are publishing the notification project, this will also publish all documents.
              return this.documentService.add(documentForm, publish);
            });
            return forkJoin(observables)
              .takeUntil(this.ngUnsubscribe)
              .subscribe();
          })
        )
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('Error: ', error);
            alert('An error has occured.');
          },
          () => { this.router.navigate(['/notification-projects']); }
        );
    } else {
      notificationProject._id = this.notificationProjectId;
      let documentForms = this.setDocumentForm(this.notificationProjectId);

      // Account for new documents.
      observables = documentForms.map(documentForm => {
        if (saveOnly) {
          // this means we just did a save
          return this.documentService.add(documentForm, this.isPublished);
        } else {
          // This means we did a save and publish/un-publish
          return this.documentService.add(documentForm, publish);
        }
      });

      // Account for existing documents.
      // Delete the ones we don't want anymore.
      this.documentsToDelete.forEach(item => observables.push(this.documentService.delete(item)));

      // Publish/un-publish the ones we are keeping.
      this.existingDocuments.forEach(item => {
        if (publish) {
          observables.push(this.documentService.publish(item._id));
        } else {
          observables.push(this.documentService.unPublish(item._id));
        }
      });

      // Finally push in the edit notification project all.
      observables.push(this.notificationProjectService.save(notificationProject, publish));

      forkJoin(observables)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('Error: ', error);
            alert('An error has occured.');
          },
          () => {
            this.router.navigate(['/np', this.notificationProjectId, 'notification-project-details']);
          }
        );
    }
  }

  public addDocuments(files: FileList) {
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list
          if (this.newDocuments.find(x => x.documentFileName === files[i].name)) {
            continue;
          }

          this.newFiles.push(files[i]);

          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;

          // save document for upload to db when project is added or saved
          this.newDocuments.push(document);
        }
      }
    }
    this._changeDetectorRef.detectChanges();
  }

  public deleteDocument(doc: Document, isExisting: boolean) {
    if (doc && isExisting) {
      this.documentsToDelete.push(doc);
      this.existingDocuments = this.existingDocuments.filter(item => (item.documentFileName !== doc.documentFileName));
    } else if (doc && !isExisting) {
      this.newFiles = this.newFiles.filter(item => (item.name !== doc.documentFileName));
      this.newDocuments = this.newDocuments.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

  private setDocumentForm(notificationProjectId) {
    let docForms = [];
    this.newDocuments.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', notificationProjectId);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('internalOriginalName', doc.internalOriginalName);
      formData.append('documentSource', 'PROJECT');
      formData.append('dateUploaded', moment());
      formData.append('datePosted', moment());
      docForms.push(formData);
    });

    return docForms;
  }

  public onCancel() {
    if (!this.isEditing) {
      this.router.navigate(['/notification-projects']);
    } else {
      this.router.navigate(['/np', this.notificationProjectId, 'notification-project-details']);
    }
  }


  private buildForm(data) {
    this.myForm = new FormGroup({
      'name': new FormControl(data.name),
      'type': new FormControl(data.type),
      'subType': new FormControl(data.subType),
      'proponentName': new FormControl(data.proponentName),
      'startDate': new FormControl(data.startDate),
      'decisionDate': new FormControl(data.decisionDate),
      'region': new FormControl(data.region),
      'notificationDecision': new FormControl(data.notificationDecision),
      'description': new FormControl(data.description),
      'longitude': new FormControl(data.centroid[0]),
      'latitude': new FormControl(data.centroid[1]),
    });
  }

  private validateForm() {
    // These fields must not be empty.
    if (this.myForm.controls.name.value === '') {
      alert('Name cannot be empty.');
      return false;
    } else if (this.myForm.controls.type.value === '') {
      alert('Type cannot be empty.');
      return false;
    } else if (this.myForm.controls.subType.value === '') {
      alert('Notification project sub-type cannot be empty.');
      return false;
    } else if (this.myForm.controls.proponentName.value === '') {
      alert('Proponent name cannot be empty.');
      return false;
    } else if (this.myForm.controls.startDate.value == null || this.myForm.controls.startDate.value === '') {
      alert('Start date cannot be empty.');
      return false;
    } else if (this.myForm.controls.decisionDate.value == null || this.myForm.controls.decisionDate.value === '') {
      alert('End date cannot be empty.');
      return false;
    } else if (this.myForm.controls.region.value === '') {
      alert('Region cannot be empty.');
      return false;
    } else if (this.myForm.controls.description.value === '') {
      alert('Description cannot be empty.');
      return false;
    } else if (this.myForm.controls.latitude.value === '') {
      alert('Latitude cannot be empty.');
      return false;
    } else if (this.myForm.controls.longitude.value === '') {
      alert('Longitude cannot be empty.');
      return false;
    }

    if (moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.controls.startDate.value)) > moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.controls.decisionDate.value))) {
      alert('Decision date must come after start date.');
      return false;
    }

    if (this.myForm.controls.latitude.value >= 60.01 || this.myForm.controls.latitude.value <= 48.20) {
      alert('Latitude must be between 48.20 and 60.01');
      return false;
    }

    if (this.myForm.controls.longitude.value >= -114.01 || this.myForm.controls.longitude.value <= -139.06) {
      alert('Longitude must be between -114.01 and -139.06');
      return false;
    }

    return true;
  }

  public onChangeType(event) {
    this.subTypeSelected = this.PROJECT_SUBTYPES[this.myForm.controls.type.value];
    this._changeDetectorRef.detectChanges();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
