import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { KeyValuePipe } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { DemiNotification, LegacyNotification, legacyNotification } from 'src/app/models/demi/notification';
import { ConfigService } from 'src/app/services/config.service';
import { NotificationProjectService, NotificationWrite } from 'src/app/services/notification-project.service';
import { DEMI_MAX_PAGE_SIZE } from 'src/app/models/demi/demi-list';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Constants } from 'src/app/shared/utils/constants';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate, isNgbDate } from 'src/app/shared/utils/utils';

// eagle-api stored `new Date(null)` read in Pacific time for a missing date; it means no date.
const NO_DATE = '1969-12-31T08:00:00.000Z';

function toDate(date: unknown): Date | null {
  const value = isNgbDate(date) ? convertFormGroupNGBDateToJSDate(date) : null;
  return value?.toISOString() === NO_DATE ? null : value;
}

/** True for an empty date control or a date the datepicker parsed; false for text it could not parse. */
const isDateOrEmpty = (date: unknown): boolean => date == null || date === '' || isNgbDate(date);

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
  private logger = inject(LoggingService);
  private toastService = inject(ToastService);

  public isAdd = false;
  public isPublished = false;
  public loading = false;
  private saving = false;
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
    notificationThresholdValue: FormControl<number | null>;
    notificationThresholdUnits: FormControl<string | null>;
    project: FormControl<string | null>;
    longitude: FormControl<number | null>;
    latitude: FormControl<number | null>;
    trigger: FormControl<unknown>;
  }>;
  public projectNotification: LegacyNotification = null;
  public regions: any[] = [];
  public subTypeSelected = [];
  public unitsSelected = [];
  public projects: any[] = ['Test'];

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

  /** Projects the notification may point at. eagle-api stores the Eagle project id, so Track-only projects are left out. */
  public getAllProjectsList() {
    this.projectService.list({ pageSize: DEMI_MAX_PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ rows }) => {
          this.projects = rows.filter(row => row.eagleId).map(row => ({ _id: row.eagleId, name: row.name }));
        },
        error: error => {
          this.logger.error('Failed to load projects', 'AddEditProjectNotificationComponent', error);
          this.toastService.error('Failed to load projects.');
        }
      });
  }

  /** `publish` null keeps the current visibility; true or false also publishes or unpublishes. */
  public onSubmit(publish: boolean | null) {
    if (this.saving || !this.validateForm()) {
      return;
    }

    const form = this.myForm.value;
    const referred = form.decision === Constants.NOTIFICATION_DECISIONS.REFERRED;
    const fields: NotificationWrite = {
      name: form.name,
      type: form.type,
      subType: form.subType,
      proponent: form.proponent,
      nature: form.nature,
      trigger: this.triggers.map(trigger => trigger.name).join(),
      region: form.region,
      location: form.location,
      decisionDate: form.decision !== 'In Progress' ? toDate(form.decisionDate) : null,
      notificationReceivedDate: toDate(form.notificationReceivedDate),
      decision: form.decision,
      associatedProjectId: referred ? form.project : null,
      associatedProjectName: referred ? this.projects.find(project => project._id === form.project)?.name : null,
      description: form.description,
      notificationThresholdValue: form.notificationThresholdValue,
      notificationThresholdUnits: form.notificationThresholdUnits,
      centroid: [String(form.latitude), String(form.longitude)]
    };

    this.saving = true;
    const done = finalize<DemiNotification>(() => { this.saving = false; });
    if (this.isAdd) {
      this.notificationProjectService.add(fields, publish === true)
        .pipe(done, takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.router.navigate(['/project-notifications']));
    } else {
      this.notificationProjectService.save(this.projectNotification.demiId, fields, publish)
        .pipe(done, takeUntilDestroyed(this.destroyRef))
        .subscribe(updated => {
          this.storageService.state.currentProject = {
            type: 'currentProjectNotification',
            data: legacyNotification(updated),
            docTotal: 0
          };
          this.router.navigate(['/pn', this.projectNotification._id, 'details']);
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
    // data.trigger is a CSV of trigger names.
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
      'notificationThresholdValue': new FormControl<number | null>(data.notificationThresholdValue),
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

    if (!isDateOrEmpty(this.myForm.value.notificationReceivedDate)) {
      this.toastService.error('Notification Received Date is not a valid date.');
      return false;
    }

    if (this.myForm.value.decision !== 'In Progress' && !isDateOrEmpty(this.myForm.value.decisionDate)) {
      this.toastService.error('Decision Date is not a valid date.');
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
