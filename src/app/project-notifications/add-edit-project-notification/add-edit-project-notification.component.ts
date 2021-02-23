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
import { ProjectService } from 'app/services/project.service';

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
  public unitsSelected = [];
  public projects = ['Test'];

  // Raw files coming in from file uploader
  public newFiles: Array<File> = [];

  // Array that contains the files after they've been converted into Documents
  public newDocuments: Document[] = [];

  // On an edit, these are the existing documents
  public existingDocuments: Document[] = [];

  // On an edit, these are the documents we are going to delete
  public documentsToDelete = [];

  public NATURE_OPTIONS: Array<string> = Constants.NOTIFICATION_NATURES;
  public PROJECT_SUBTYPES: Object = Constants.PROJECT_SUBTYPES(2018);
  public PROJECT_NOTIFICATION_THRESHOLD_UNITS: Object = Constants.PROJECT_NOTIFICATION_THRESHOLD_UNITS;
  public PROJECT_TYPES: Array<Object> = Constants.PROJECT_TYPES(2018);
  public NOTIFICATION_TRIGGERS: Array<Object> = Constants.NOTIFICATION_TRIGGERS;
  public NOTIFICATION_DECISIONS = Constants.NOTIFICATION_DECISIONS;
  public NATURE_DEFAULT = 'New Construction';
  public NATURE_MODIFIED = 'Modification of Existing';

  public triggers: any[];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private configService: ConfigService,
    private notificationProjectService: NotificationProjectService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private utils: Utils,
    private projectService: ProjectService,
  ) { }

  public ngOnInit() {
    this.regions = this.configService.regions;
    // Determine if this an add or edit.
    this.route.url.subscribe(segments => {
      segments.map(segment => {
        this.projectNotification = this.storageService.state.currentProject && this.storageService.state.currentProject.data;
        if (segment.path === 'add') {
          this.isAdd = true;
          if (this.isAdd || !this.projectNotification) {
            this.buildForm({
              'name': '',
              'type': '',
              'subType': '',
              'proponent': '',
              'nature': '',
              'region': '',
              'location': '',
              'decision': '',
              'decisionDate': undefined,
              'notificationReceivedDate': undefined,
              'project': '',
              'description': '',
              'notificationThresholdValue': undefined,
              'notificationThresholdUnits': '',
              'centroid': ['', ''],
              'trigger': '',
            });

            this.getAllProjectsList();
            this.loading = false;
            this._changeDetectorRef.detectChanges();
          }
        } else if (segment.path === 'edit') {
          if (this.projectNotification.read.includes('public')) {
            this.isPublished = true;
          }

          let editData = { ...this.projectNotification  };
          // new Date(null) will create a date of 31/12/1969, so if decisionDate is null, don't create a date object here.
          editData.decisionDate = this.projectNotification.decisionDate !== null ? this.utils.convertJSDateToNGBDate(new Date(this.projectNotification.decisionDate)) : undefined as any;
          editData.notificationReceivedDate = this.projectNotification.notificationReceivedDate !== null ? this.utils.convertJSDateToNGBDate(new Date(this.projectNotification.notificationReceivedDate)) : undefined as any;
          this.buildForm(editData);
          this.subTypeSelected = this.PROJECT_SUBTYPES[this.myForm.controls.type.value];
          this.unitsSelected = this.PROJECT_NOTIFICATION_THRESHOLD_UNITS[this.myForm.controls.type.value];

          this.getAllProjectsList();
          this.loading = false;
          this._changeDetectorRef.detectChanges();
        }
      });
    });
  }

  // loads all the projects for the projects list
  public getAllProjectsList () {
    this.projectService.getAll(1, 1000, '+name')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res2: any) => {
        if (res2) {
          this.projects = res2.data;
        }
      });
  }

  public onSubmit(publish) {
    if (!this.validateForm()) {
      return;
    }

    if (publish === null && this.isPublished) {
      publish = true;
    } else if (publish === null && !this.isPublished) {
      publish = false;
    }

    let associatedProjectName;
    for (let project in this.projects) {
      if ( this.projects[project]['_id'] === this.myForm.value.project ) {
        associatedProjectName = this.projects[project]['name'];
        break;
      }
    }
    let triggerCSV = [];
    this.triggers.forEach(trigger => {
      triggerCSV.push(trigger.name);
    });

    let notificationProject = new ProjectNotification({
      name: this.myForm.value.name,
      type: this.myForm.value.type,
      subType: this.myForm.value.subType,
      proponent: this.myForm.value.proponent,
      nature: this.myForm.value.nature,
      trigger: triggerCSV.join(),
      region: this.myForm.value.region,
      location: this.myForm.value.location,
      decisionDate: this.myForm.value.decisionDate !== null && this.myForm.value.decision !== 'In Progress' ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.value.decisionDate))) : null,
      notificationReceivedDate: this.myForm.value.notificationReceivedDate !== null ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.value.notificationReceivedDate))) : null,
      decision: this.myForm.value.decision,
      associatedProjectId:  this.myForm.value.decision === Constants.NOTIFICATION_DECISIONS.REFERRED ? this.myForm.value.project : null,
      associatedProjectName:  this.myForm.value.decision === Constants.NOTIFICATION_DECISIONS.REFERRED ? associatedProjectName : null,

      description: this.myForm.value.description,
      notificationThresholdValue: this.myForm.value.notificationThresholdValue,
      notificationThresholdUnits: this.myForm.value.notificationThresholdUnits,
      centroid: [this.myForm.value.latitude, this.myForm.value.longitude]
    });

    // Failsafe: if the dates are set to new Date(null) it'll create a date in 1969.
    // we can assume a date of 31/12/1969@8:00 should actually be null
    if (notificationProject.decisionDate && notificationProject.decisionDate.toISOString() === '1969-12-31T08:00:00.000Z') {
      notificationProject.decisionDate = null;
    }

    if (notificationProject.notificationReceivedDate && notificationProject.notificationReceivedDate.toISOString() === '1969-12-31T08:00:00.000Z') {
      notificationProject.notificationReceivedDate = null;
    }

    if (this.isAdd) {
      this.notificationProjectService.add(notificationProject, publish)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          () => {
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
          () => {
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
    // data will be csv in trigger attribute, so split into names
    // then add the constant values into 'triggers' that match
    // also, trigger the natureDisabled flag as needed

    this.triggers = [];
    let dataTriggers =  data.trigger.split(',');

    Constants.NOTIFICATION_TRIGGERS.forEach(trigger => {
      if (dataTriggers.includes(trigger.name)) {
        this.triggers.push(trigger);
      }
    });

    this.myForm = new FormGroup({
      'name': new FormControl(data.name),
      'type': new FormControl(data.type),
      'subType': new FormControl(data.subType),
      'proponent': new FormControl(data.proponent),
      'nature': new FormControl(data.nature),
      'region': new FormControl(data.region),
      'location': new FormControl(data.location),
      'decision': new FormControl(data.decision),
      'decisionDate': new FormControl(data.decisionDate),
      'notificationReceivedDate': new FormControl(data.notificationReceivedDate),
      'description': new FormControl(data.description),
      'notificationThresholdValue': new FormControl(data.notificationThresholdValue),
      'notificationThresholdUnits': new FormControl(data.notificationThresholdUnits),
      'project': new FormControl(data.associatedProjectId),
      'longitude': new FormControl(data.centroid[1]),
      'latitude': new FormControl(data.centroid[0]),
      'trigger': new FormControl(this.triggers)
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

    if (!this.myForm.value.proponent) {
      alert('Notification project proponent cannot be empty.');
      return false;
    }

    if (this.triggers.length === 0) {
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

    if (!this.myForm.value.notificationThresholdValue) {
      alert('Notification Threshold Value cannot be empty.');
      return false;
    }

    if (!this.myForm.value.notificationThresholdUnits) {
      alert('Notification Threshold Units cannot be empty.');
      return false;
    }

    if (!this.myForm.value.nature) {
      alert('Project Nature cannot be empty.');
      return false;
    }

    if (!this.myForm.value.notificationReceivedDate) {
      alert('Notification Received Date cannot be empty.');
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

  public onChangeType() {
    this.subTypeSelected = this.PROJECT_SUBTYPES[this.myForm.controls.type.value];
    this.unitsSelected = this.PROJECT_NOTIFICATION_THRESHOLD_UNITS[this.myForm.controls.type.value];
    this._changeDetectorRef.detectChanges();
  }

  public onChangeTrigger() {
    let natureModified = false;
    this.triggers.forEach(trigger => {
      if (trigger.name === 'Greenhouse Gases (modification)') {
        natureModified = true;
      }
    });

    this.myForm.patchValue(natureModified ? { nature: this.NATURE_MODIFIED } : { nature: this.NATURE_DEFAULT });
    this._changeDetectorRef.detectChanges();
  }

  clearSelectedItem(item: any) {
    this.triggers = this.triggers.filter(option => option.name !== item.name);
    this.onChangeTrigger();
  }

  public filterCompareWith(filter: any, filterToCompare: any) {
      return filter && filterToCompare
             ? filter.name === filterToCompare.name
             : filter === filterToCompare;
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
