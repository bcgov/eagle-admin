import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { map } from 'rxjs/operators';
import { Subject, forkJoin } from 'rxjs';
import * as moment from 'moment-timezone';

import { Document } from 'app/models/document';
import { DocumentService } from 'app/services/document.service';
import { ProjectNotification } from 'app/models/projectNotification';

import { ConfigService } from 'app/services/config.service';
import { Constants } from 'app/shared/utils/constants';
import { NotificationProjectService } from 'app/services/notification-project.service';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-add-edit-notification-project',
  templateUrl: './add-edit-project-notification.component.html',
  styleUrls: ['./add-edit-project-notification.component.scss']
})

export class AddEditProjectNotificationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isEditing = false;
  public isPublished = false;
  public loading = false;
  public myForm: FormGroup;
  public projectNotification: ProjectNotification = null;
  public projectNotificationId = '';
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
  public NOTIFICATION_TRIGGERS: Array<string> = Constants.NOTIFICATION_TRIGGERS;
  public NOTIFICATION_DECISIONS: Array<string> = Constants.NOTIFICATION_DECISIONS;
  public NATURE_DEFAULT = 'New Construction';

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
        this.projectNotificationId = this.isEditing ? res.notificationProject.data._id : '';

        if (!this.isEditing) {
          this.buildForm({
            'name': '',
            'type': '',
            'subType': '',
            'nature': this.NATURE_DEFAULT,
            'region': '',
            'location': '',
            'decision': '',
            'decisionDate': '',
            'description': '',
            'latitude': '',
            'longitude': '',
            'trigger': '',
          });
        } else {
          this.projectNotification = ProjectNotification.mapResponseToModel(res.notificationProject.data);
          this.existingDocuments = res.documents[0].data.searchResults;

          if (this.projectNotification.read.includes('public')) {
            this.isPublished = true;
          }

          let editData = { ...this.projectNotification  };
          editData.decisionDate = this.utils.convertJSDateToNGBDate(new Date(this.projectNotification.decisionDate)) as any;
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
    if (publish === null) {
      saveOnly = true;
    }

    if (publish === null && this.isPublished) {
      publish = true;
    } else if (publish === null && !this.isPublished) {
      publish = false;
    }

    let notificationProject = new ProjectNotification({
      name: this.myForm.value.name,
      type: this.myForm.value.type,
      subType: this.myForm.value.subType,
      nature: this.myForm.get('nature').disabled ? this.NATURE_DEFAULT : this.myForm.value.nature,
      trigger: this.myForm.value.trigger,
      region: this.myForm.value.region,
      location: this.myForm.value.location,
      decisionDate: this.myForm.value.decisionDate ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.value.decisionDate))).toISOString() : null,
      notificationDecision: this.myForm.value.notificationDecision,
      description: this.myForm.value.description,
      centroid: [this.myForm.value.longitude, this.myForm.value.latitude]
    });

    if (!this.isEditing) {
      this.notificationProjectService.add(notificationProject, publish)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            alert('An error has occurred.');
          },
          () => { this.router.navigate(['/project-notifications']); }
        );
    } else {
      notificationProject._id = this.projectNotificationId;

      this.notificationProjectService.save(notificationProject, publish)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            alert('An error has occurred.');
          },
          () => {
            this.router.navigate(['/pn', this.projectNotificationId, 'details']);
          }
        );
    }
  }

  public onCancel() {
    if (!this.isEditing) {
      this.router.navigate(['/project-notifications']);
    } else {
      this.router.navigate(['/pn', this.projectNotificationId, 'notification-project-details']);
    }
  }

  private buildForm(data) {
    const natureDisabled = data.trigger !== 'Greenhouse Gases';

    this.myForm = new FormGroup({
      'name': new FormControl(data.name),
      'type': new FormControl(data.type),
      'subType': new FormControl(data.subType),
      'nature': new FormControl({ value: data.nature, disabled: natureDisabled }),
      'region': new FormControl(data.region),
      'location': new FormControl(data.location),
      'decision': new FormControl(data.notificationDecision),
      'decisionDate': new FormControl(data.decisionDate),
      'description': new FormControl(data.description),
      'longitude': new FormControl(data.longitude),
      'latitude': new FormControl(data.latitude),
      'trigger': new FormControl(data.trigger)
    });
  }

  private validateForm() {
    // These fields must not be empty.
    if (!this.myForm.value.name) {
      alert('Name cannot be empty.');
      return false;
    }

    if (!this.myForm.value.type) {
      alert('Type cannot be empty.');
      return false;
    }

    if (!this.myForm.value.subType) {
      alert('Notification project sub-type cannot be empty.');
      return false;
    }

    if (this.myForm.get('nature').enabled && !this.myForm.value.nature) {
      alert('Nature cannot be empty.');
      return false;
    }

    if (!this.myForm.value.trigger) {
      alert('Trigger cannot be empty.');
      return false;
    }

    if (!this.myForm.value.decision) {
      alert('Decision cannot be empty.');
      return false;
    }

    if (!this.myForm.value.region) {
      alert('Region cannot be empty.');
      return false;
    }

    if (!this.myForm.value.location) {
      alert('Location cannot be empty.');
      return false;
    }

    if (!this.myForm.value.description) {
      alert('Description cannot be empty.');
      return false;
    }

    if (!this.myForm.value.latitude) {
      alert('Latitude cannot be empty.');
      return false;
    }

    if (!this.myForm.value.longitude) {
      alert('Longitude cannot be empty.');
      return false;
    }

    if (this.myForm.value.latitude >= 60.01 || this.myForm.value.latitude <= 48.20) {
      alert('Latitude must be between 48.20 and 60.01');
      return false;
    }

    if (this.myForm.value.longitude >= -114.01 || this.myForm.value.longitude <= -139.06) {
      alert('Longitude must be between -114.01 and -139.06');
      return false;
    }

    return true;
  }

  public onChangeType(event) {
    this.subTypeSelected = this.PROJECT_SUBTYPES[this.myForm.controls.type.value];
    this._changeDetectorRef.detectChanges();
  }

  public onChangeTrigger(event) {
    const trigger = this.myForm.value.trigger;

    if (trigger !== 'Greenhouse Gases') {
      // Nature can only be modified from the default for one selection. Revert to the default if not.
      this.myForm.patchValue({ nature: this.NATURE_DEFAULT });
      this.myForm.get('nature').disable();
    } else {
      this.myForm.get('nature').enable();
    }

    this._changeDetectorRef.detectChanges();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
