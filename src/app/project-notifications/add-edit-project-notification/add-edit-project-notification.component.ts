import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeyValuePipe } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { DateTime } from 'luxon';
import { ProjectNotification } from 'src/app/models/projectNotification';
import { ConfigService } from 'src/app/services/config.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { Constants } from 'src/app/shared/utils/constants';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-add-edit-notification-project',
    imports: [NgbDatepickerModule, FormsModule, ReactiveFormsModule, NgSelectModule, KeyValuePipe, RouterLink],
    templateUrl: './add-edit-project-notification.component.html',
    styleUrl: './add-edit-project-notification.component.css',
    
})

export class AddEditProjectNotificationComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private configService = inject(ConfigService);
  private notificationProjectService = inject(NotificationProjectService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  public isAdd = false;
  public isPublished = false;
  public loading = false;
  public myForm: FormGroup<{
    name: FormControl<string | null>;
    type: FormControl<string | null>;
    subType: FormControl<string | null>;
    proponent: FormControl<string | null>;
    nature: FormControl<string | null>;
    region: FormControl<string | null>;
    location: FormControl<string | null>;
    decision: FormControl<string | null>;
    decisionDate: FormControl<unknown>;
    notificationReceivedDate: FormControl<unknown>;
    description: FormControl<string | null>;
    notificationThresholdValue: FormControl<string | null>;
    notificationThresholdUnits: FormControl<string | null>;
    project: FormControl<string | null>;
    longitude: FormControl<number | null>;
    latitude: FormControl<number | null>;
    trigger: FormControl<unknown>;
  }>;
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
  public PROJECT_SUBTYPES: object = Constants.PROJECT_SUBTYPES(2018);
  public PROJECT_NOTIFICATION_THRESHOLD_UNITS: object = Constants.PROJECT_NOTIFICATION_THRESHOLD_UNITS;
  public PROJECT_TYPES: Array<string> = Constants.PROJECT_TYPES(2018);
  public NOTIFICATION_TRIGGERS: Array<object> = Constants.NOTIFICATION_TRIGGERS;
  public NOTIFICATION_DECISIONS = Constants.NOTIFICATION_DECISIONS;
  public NATURE_DEFAULT = 'New Construction';
  public NATURE_MODIFIED = 'Modification of Existing';

  public triggers: any[];

  public ngOnInit() {
    this.regions = this.configService.regions;
    // Determine if this an add or edit.
    this.route.url.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(segments => {
      segments.map(segment => {
        this.projectNotification = this.storageService.state.currentProject && this.storageService.currentProjectData;
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
          }
        } else if (segment.path === 'edit') {
          if (this.projectNotification.read.includes('public')) {
            this.isPublished = true;
          }

          const editData = { ...this.projectNotification };
          // new Date(null) will create a date of 31/12/1969, so if decisionDate is null, don't create a date object here.
          editData.decisionDate = this.projectNotification.decisionDate !== null ? convertJSDateToNGBDate(new Date(this.projectNotification.decisionDate)) : undefined as any;
          editData.notificationReceivedDate = this.projectNotification.notificationReceivedDate !== null ? convertJSDateToNGBDate(new Date(this.projectNotification.notificationReceivedDate)) : undefined as any;
          this.buildForm(editData);
          this.subTypeSelected = this.PROJECT_SUBTYPES[this.myForm.controls.type.value];
          this.unitsSelected = this.PROJECT_NOTIFICATION_THRESHOLD_UNITS[this.myForm.controls.type.value];

          this.getAllProjectsList();
          this.loading = false;
        }
      });
    });
  }

  // loads all the projects for the projects list
  public getAllProjectsList() {
    this.projectService.getAll(1, 1000, '+name')
      .pipe(takeUntilDestroyed(this.destroyRef))
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
    for (const project in this.projects) {
      if (this.projects[project]['_id'] === this.myForm.value.project) {
        associatedProjectName = this.projects[project]['name'];
        break;
      }
    }
    const triggerCSV = [];
    this.triggers.forEach(trigger => {
      triggerCSV.push(trigger.name);
    });

    const notificationProject = new ProjectNotification({
      name: this.myForm.value.name,
      type: this.myForm.value.type,
      subType: this.myForm.value.subType,
      proponent: this.myForm.value.proponent,
      nature: this.myForm.value.nature,
      trigger: triggerCSV.join(),
      region: this.myForm.value.region,
      location: this.myForm.value.location,
      decisionDate: this.myForm.value.decisionDate !== null && this.myForm.value.decision !== 'In Progress' ? DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(this.myForm.value.decisionDate)).toJSDate() : null,
      notificationReceivedDate: this.myForm.value.notificationReceivedDate !== null ? DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(this.myForm.value.notificationReceivedDate)).toJSDate() : null,
      decision: this.myForm.value.decision,
      associatedProjectId: this.myForm.value.decision === Constants.NOTIFICATION_DECISIONS.REFERRED ? this.myForm.value.project : null,
      associatedProjectName: this.myForm.value.decision === Constants.NOTIFICATION_DECISIONS.REFERRED ? associatedProjectName : null,

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
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: () => {
            alert('An error has occurred.');
          },
          complete: () => { this.router.navigate(['/project-notifications']); }
        });
    } else {
      notificationProject._id = this.projectNotification._id;
      this.notificationProjectService.save(notificationProject, publish)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => {
            this.storageService.state.currentProject = {
              type: 'currentProjectNotification',
              data: updated,
              docTotal: 0
            };
            this.router.navigate(['/pn', this.projectNotification._id, 'details']);
          },
          error: () => {
            alert('An error has occurred.');
          }
        });
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
    const dataTriggers = data.trigger.split(',');

    Constants.NOTIFICATION_TRIGGERS.forEach(trigger => {
      if (dataTriggers.includes(trigger.name)) {
        this.triggers.push(trigger);
      }
    });

    this.myForm = new FormGroup({
      'name': new FormControl<string | null>(data.name),
      'type': new FormControl<string | null>(data.type),
      'subType': new FormControl<string | null>(data.subType),
      'proponent': new FormControl<string | null>(data.proponent),
      'nature': new FormControl<string | null>(data.nature),
      'region': new FormControl<string | null>(data.region),
      'location': new FormControl<string | null>(data.location),
      'decision': new FormControl<string | null>(data.decision),
      'decisionDate': new FormControl<unknown>(data.decisionDate),
      'notificationReceivedDate': new FormControl<unknown>(data.notificationReceivedDate),
      'description': new FormControl<string | null>(data.description),
      'notificationThresholdValue': new FormControl<string | null>(data.notificationThresholdValue),
      'notificationThresholdUnits': new FormControl<string | null>(data.notificationThresholdUnits),
      'project': new FormControl<string | null>(data.associatedProjectId),
      'longitude': new FormControl<number | null>(data.centroid[1]),
      'latitude': new FormControl<number | null>(data.centroid[0]),
      'trigger': new FormControl<unknown>(this.triggers)
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
  }

  public onChangeTrigger() {
    let natureModified = false;
    this.triggers.forEach(trigger => {
      if (trigger.name === 'Greenhouse Gases (modification)') {
        natureModified = true;
      }
    });

    this.myForm.patchValue(natureModified ? { nature: this.NATURE_MODIFIED } : { nature: this.NATURE_DEFAULT });
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

}
