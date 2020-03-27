import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';

import { Document } from 'app/models/document';
import { ProjectNotification } from 'app/models/projectNotification';

import { ConfigService } from 'app/services/config.service';
import { StorageService } from 'app/services/storage.service';
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

  public isAdd = false;
  public isPublished = false;
  public loading = false;
  public myForm: FormGroup;
  public projectNotification: ProjectNotification = null;
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
    private notificationProjectService: NotificationProjectService,
    private storageService: StorageService,
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

    this.route.url
      .takeUntil(this.ngUnsubscribe)
      .subscribe((url) => {
        // Determine if this an add or edit.
        this.isAdd = url.some(urlObject => urlObject.path === 'add');
        this.projectNotification = this.storageService.state.currentProject && this.storageService.state.currentProject.data;

        if (this.isAdd || !this.projectNotification) {
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
            'centroid': ['', ''],
            'trigger': '',
          });
        } else {

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
      decision: this.myForm.value.decision,
      description: this.myForm.value.description,
      centroid: [this.myForm.value.latitude, this.myForm.value.longitude]
    });

    if (this.isAdd) {
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
      notificationProject._id = this.projectNotification._id;

      this.notificationProjectService.save(notificationProject, publish)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            alert('An error has occurred.');
          },
          () => {
            this.router.navigate(['/pn', this.projectNotification._id, 'details']);
          }
        );
    }
  }

  public onCancel() {
    if (this.isAdd) {
      this.router.navigate(['/project-notifications']);
    } else {
      this.router.navigate(['/pn', this.projectNotification._id, 'details']);
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
      'decision': new FormControl(data.decision),
      'decisionDate': new FormControl(data.decisionDate),
      'description': new FormControl(data.description),
      'longitude': new FormControl(data.centroid[1]),
      'latitude': new FormControl(data.centroid[0]),
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
