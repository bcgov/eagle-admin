import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Subject } from 'rxjs';
import { Utils } from 'app/shared/utils/utils';
import { MatSnackBar } from '@angular/material';

import { StorageService } from 'app/services/storage.service';
import { ConfigService } from 'app/services/config.service';
import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ContactSelectTableRowsComponent } from 'app/shared/components/contact-select-table-rows/contact-select-table-rows.component';
import { Constants } from 'app/shared/utils/constants';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { ModificationsListTableRowsComponent } from './modifications-list-table-rows/modifications-list-table-rows.component';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.scss']
})
export class AddEditProjectComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public myForm: FormGroup;
  public documents: any[] = [];
  public back: any = {};
  public regions: any[] = [];
  public sectorsSelected = [];
  public proponentName = '';
  public proponentId = '';
  public modifications = [];
  public modificationsTableData: TableObject;
  public modificationsTableColumns: any[] = [
    {
      name: 'Type',
      value: 'type',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Applied To',
      value: 'appliedTo',
      width: 'col-4',
      nosort: true
    },
    {
      name: 'Start',
      value: 'start',
      width: 'col-3',
      nosort: true
    },
    {
      name: 'End',
      value: 'end',
      width: 'col-3',
      nosort: true
    }
  ];

  public PROJECT_SUBTYPES: Object = Constants.PROJECT_SUBTYPES;
  public PROJECT_TYPES: Array<Object> = Constants.PROJECT_TYPES;
  public PROJECT_STATUS: Array<Object> = Constants.PROJECT_STATUS;
  public PROJECT_NATURE: Array<Object> = Constants.PROJECT_NATURE;
  public EAC_DECISIONS: Array<Object> = Constants.EAC_DECISIONS;

  public projectName;
  public projectId;
  public project;

  public isEditing = false;

  public loading = true;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private config: ConfigService,
    private _changeDetectorRef: ChangeDetectorRef,
    private utils: Utils,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private storageService: StorageService
  ) {
  }

  ngOnInit() {
    // This is to get Region information from List (db) and put into a list(regions)
    this.config.getRegions()
      .subscribe(regions => {
        this.regions = regions;
      });

    // Get data related to current project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        this.isEditing = Object.keys(data).length === 0 && data.constructor === Object ? false : true;

        if (this.storageService.state.selectedOrganization) {
          this.proponentName = this.storageService.state.selectedOrganization.name;
          this.proponentId = this.storageService.state.selectedOrganization._id;
        } else if (this.isEditing && data.project.proponent._id && data.project.proponent._id !== '') {
          this.proponentName = data.project.proponent.name;
          this.proponentId = data.project.proponent._id;
        }
        this.project = data.project;
        this.buildForm(data);

        if (this.storageService.state.selectedContactType && this.storageService.state.selectedContact) {
          switch (this.storageService.state.selectedContactType) {
            case 'epd': {
              this.myForm.controls.responsibleEPDId.setValue(this.storageService.state.selectedContact._id);
              this.myForm.controls.responsibleEPD.setValue(this.storageService.state.selectedContact.displayName);
              break;
            }
            case 'lead': {
              this.myForm.controls.projectLeadId.setValue(this.storageService.state.selectedContact._id);
              this.myForm.controls.projectLead.setValue(this.storageService.state.selectedContact.displayName);
              break;
            }
            default: {
              return;
            }
          }
          this.storageService.state.selectedContactType = null;
          this.storageService.state.selectedContact = null;
        }

        this.loading = false;
        try {
          this._changeDetectorRef.detectChanges();
        } catch (e) {
          // console.log('e:', e);
        }
      });

    this.back = this.storageService.state.back;
  }

  buildForm(resolverData) {
    if (this.storageService.state.form) {
      console.log('form from ss');
      // TODO: Save the projectID if it was originally an edit.
      this.myForm = this.storageService.state.form;
      this.onChangeType(null);
    } else if (!(Object.keys(resolverData).length === 0 && resolverData.constructor === Object)) {
      // First entry on resolver
      console.log('form from rs', resolverData);
      this.projectId = resolverData.project._id;
      this.myForm = this.buildFormFromData(resolverData.project);
      this.onChangeType(null);
    } else {
      console.log('form from blank');
      this.myForm = new FormGroup({
        'name': new FormControl(),
        'proponent': new FormControl(),
        'build': new FormControl(),
        'type': new FormControl(),
        'sector': new FormControl(),
        'description': new FormControl(),
        'location': new FormControl(),
        'region': new FormControl(),
        'lat': new FormControl([]),
        'lon': new FormControl([]),
        'addFile': new FormControl(),
        'CEAAInvolvement': new FormControl(),
        'CEAALink': new FormControl(),
        'ea': new FormControl(),
        'capital': new FormControl(),
        'notes': new FormControl(),
        'eaStatus': new FormControl(),
        'eaStatusDate': new FormControl(),
        'status': new FormControl(this.PROJECT_STATUS[2]),
        'projectStatusDate': new FormControl(),
        'eacDecision': new FormControl(this.EAC_DECISIONS[0]),
        'decisionDate': new FormControl(),
        'substantially': new FormControl(),
        'substantiallyDate': new FormControl(),
        'activeStatus': new FormControl(),
        'activeDate': new FormControl(),
        'responsibleEPDId': new FormControl(),
        'responsibleEPD': new FormControl(),
        'projectLeadId': new FormControl(),
        'projectLead': new FormControl(),
        'review180Start': new FormControl(),
        'review45Start': new FormControl()
      });
    }
    if (this.project && this.project.reviewExtensions) {
      this.project.reviewExtensions.forEach( item => {
        this.modifications.push(item);
      });
    }
    if (this.project && this.project.reviewSuspensions) {
      this.project.reviewSuspensions.forEach( item => {
        this.modifications.push(item);
      });
    }
    this.modificationsTableData = new TableObject(
      ModificationsListTableRowsComponent,
      this.modifications,
      []
    );

  }

  public addExtension() {
    this.storageService.state.form = this.myForm;
    this.storageService.state.extensionType = 'add-extension';
    this.setNavigation();
    this.router.navigate(['/p', this.project._id, 'edit', 'add-extension']);
  }

  public addSuspension() {
    this.storageService.state.extensionType = 'add-suspension';
    this.storageService.state.form = this.myForm;
    this.setNavigation();
    this.router.navigate(['/p', this.project._id, 'edit', 'add-suspension']);
  }

  public onItemClicked(item) {
    if (item.type === 'Extension') {
      this.storageService.state.extensionType = 'edit-extension';
    } else {
      this.storageService.state.extensionType = 'edit-suspension';
    }
    this.storageService.state.extension = item;
    this.storageService.state.form = this.myForm;
    this.setNavigation();
    this.router.navigate(['/p', this.project._id, 'edit', this.storageService.state.extensionType]);
  }

  private setNavigation() {
    if (!this.isEditing) {
      this.navigationStackUtils.pushNavigationStack(
        ['/projects', 'add'],
        [
          {
            route: ['/projects'],
            label: 'All Projects'
          },
          {
            route: ['/projects', 'add'],
            label: 'Add'
          }
        ]
      );
    } else {
      this.navigationStackUtils.pushNavigationStack(
        ['/p', this.project._id, 'edit'],
        [
          {
            route: ['/projects'],
            label: 'All Projects'
          },
          {
            route: ['/p', this.project._id],
            label: this.project.name
          },
          {
            route: ['/p', this.project._id, 'edit'],
            label: 'Edit'
          }
        ]
      );
    }
  }

  buildFormFromData(formData) {
    // Preselector for region.
    if (formData.region) {
      let theRegion = this.regions.filter((region: any) => {
        if (region.id === formData.region) {
          return true;
        }
      });
      if (theRegion && theRegion.length === 1) {
        formData.region = theRegion[0];
      }
    }

    if (!formData.substantially) {
      formData.substantially = 'no';
    } else {
      formData.substantially = 'yes';
    }

    if (!formData.centroid) {
      formData.centroid = [-123.3656, 48.4284];
    }

    if (formData.responsibleEPDId == null || formData.responsibleEPDId === '') {
      formData.responsibleEPD = null;
    }
    if (formData.projectLeadId == null || formData.projectLeadId === '') {
      formData.projectLead = null;
    }
    if (formData.responsibleEPDObj == null) {
      formData.responsibleEPDObj = {
        _id: null,
        displayName: null
      };
    }
    if (formData.projectLeadObj == null) {
      formData.projectLeadObj = {
        _id: null,
        displayName: null
      };
    }

    let theForm = new FormGroup({
      'name': new FormControl(formData.name),
      'proponent': new FormControl(formData.proponent),
      'build': new FormControl(formData.build),
      'type': new FormControl(formData.type),
      'sector': new FormControl(formData.sector),
      'description': new FormControl(formData.description),
      'location': new FormControl(formData.location),
      'region': new FormControl(formData.region),
      'lat': new FormControl(formData.centroid[1]),
      'lon': new FormControl(formData.centroid[0]),
      'addFile': new FormControl(formData.addFile),
      'CEAAInvolvement': new FormControl(formData.CEAAInvolvement),
      'CEAALink': new FormControl(formData.CEAALink),
      'ea': new FormControl(formData.ea),
      'capital': new FormControl(formData.intake.investment),
      'notes': new FormControl(formData.intake.investmentNotes),
      'eaStatus': new FormControl(formData.eaStatus),
      'eaStatusDate': new FormControl(),
      'status': new FormControl(formData.status || this.PROJECT_STATUS[2]),
      'projectStatusDate': new FormControl(),
      'eacDecision': new FormControl(formData.eacDecision || this.EAC_DECISIONS[0]),
      'decisionDate': new FormControl(this.utils.convertJSDateToNGBDate(new Date(formData.decisionDate))),
      'substantially': new FormControl(formData.substantially),
      'substantiallyDate': new FormControl(),
      'activeStatus': new FormControl(formData.activeStatus),
      'activeDate': new FormControl(),
      'responsibleEPDId': new FormControl(formData.responsibleEPDObj._id),
      'responsibleEPD': new FormControl(formData.responsibleEPDObj.displayName),
      'projectLeadId': new FormControl(formData.projectLeadObj._id),
      'projectLead': new FormControl(formData.projectLeadObj.displayName),
      'review180Start': new FormControl(this.utils.convertJSDateToNGBDate(new Date(formData.review180Start))),
      'review45Start': new FormControl(this.utils.convertJSDateToNGBDate(new Date(formData.review45Start)))
    });
    this.sectorsSelected = this.PROJECT_SUBTYPES[formData.type];
    return theForm;
  }

  onChangeType(event) {
    this.sectorsSelected = this.PROJECT_SUBTYPES[this.myForm.controls.type.value];
    this._changeDetectorRef.detectChanges();
  }

  onCancel() {
    this.clearStorageService();
    if (this.back && this.back.url) {
      this.router.navigate(this.back.url);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  isSelected(val) {
    if (this.myForm.controls.build.value === val) {
      return true;
    } else {
      return false;
    }
  }

  isEACSelected(val) {
    if (this.myForm.controls.eaStatus.value === val) {
      return true;
    } else {
      return false;
    }
  }

  private getDate(value) {
    // nb: isNaN(undefined) returns true, while isNaN(null) returns false
    let date = value === null ? undefined : value.day;
    return isNaN(date) ? null : new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(value))).toISOString();
  }
  convertFormToProject(form) {
    return {
      'name': form.controls.name.value,
      'proponent': this.proponentId,
      'build': form.controls.build.value,
      'type': form.controls.type.value,
      'sector': form.controls.sector.value,
      'description': form.controls.description.value,
      'location': form.controls.location.value,
      'region': form.controls.region.value,
      'centroid': [form.get('lon').value, form.get('lat').value],
      'addFile': form.controls.addFile.value,
      'CEAAInvolvement': form.controls.CEAAInvolvement.value,
      'CEAALink': form.controls.CEAALink.value,
      'ea': form.controls.ea.value,
      'intake': { investment: form.controls.capital.value, notes: form.controls.notes.value },
      'eaStatus': form.controls.eaStatus.value,
      // 'eaStatusDate': form.get('eaStatusDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('eaStatusDate').value))).toISOString() : null,
      'status': form.controls.status.value,
      // 'projectStatusDate': form.get('projectStatusDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('projectStatusDate').value))).toISOString() : null,
      'eacDecision': form.controls.eacDecision.value,
      'decisionDate': this.getDate(form.get('decisionDate').value),
      'substantially': form.controls.substantially.value === 'yes' ? true : false,
      // 'substantiallyDate': form.get('substantiallyDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('substantiallyDate').value))).toISOString() : null,
      'activeStatus': form.controls.activeStatus.value,
      // 'activeDate': form.get('activeDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('activeDate').value))).toISOString() : null,
      'responsibleEPDId': form.controls.responsibleEPDId.value,
      'projectLeadId': form.controls.projectLeadId.value,
      'review180Start': this.getDate(form.get('review180Start').value),
      'review45Start': this.getDate(form.get('review45Start').value)
    };
  }

  private clearStorageService() {
    this.storageService.state.extension = null;
    this.storageService.state.extensionType = null;
    this.storageService.state.form = null;
    this.storageService.state.selectedOrganization = null;
    this.navigationStackUtils.popNavigationStack();
  }

  public linkOrganization() {
    this.storageService.state.form = this.myForm;
    this.setNavigation();
    if (!this.isEditing) {
      this.router.navigate(['/projects', 'add', 'link-org']);
    } else {
      this.router.navigate(['/p', this.project._id, 'edit', 'link-org']);
    }
  }

  private validateForm() {
    if (this.myForm.controls.name.value === '' || this.myForm.controls.name.value == null) {
      alert('Name cannot be empty.');
      return false;
    } else if (this.proponentId === '') {
      alert('Proponent cannot be empty.');
      return false;
    } else if (this.myForm.controls.build.value === '') {
      alert('You must select a project nature.');
      return false;
    } else if (this.myForm.controls.type.value === '') {
      alert('You must select a type.');
      return false;
    } else if (this.myForm.controls.sector.value === '') {
      alert('You must select a sub-type.');
      return false;
    } else if (this.myForm.controls.description.value === '') {
      alert('Description cannot be empty.');
      return false;
    } else if (this.myForm.controls.region.value === '') {
      alert('You must select a region.');
      return false;
    } else if (this.myForm.controls.location.value === '') {
      alert('Location cannot be empty.');
      return false;
    } else if (this.myForm.controls.lon.value === '') {
      alert('Longitude cannot be empty.');
      return false;
    } else if (this.myForm.controls.lat.value === '') {
      alert('Latitude cannot be empty.');
      return false;
    } else if (this.myForm.controls.lat.value >= 60.01 || this.myForm.controls.lat.value <= 48.20) {
      alert('Latitude must be between 48.20 and 60.01');
      return false;
    } else if (this.myForm.controls.lon.value >= -114.01 || this.myForm.controls.lon.value <= -139.06) {
      alert('Longitude must be between -114.01 and -139.06');
      return false;
    } else if (this.myForm.controls.responsibleEPDId.value == null || this.myForm.controls.responsibleEPDId.value === '') {
      alert('You must select an EPD');
      return false;
    } else if (this.myForm.controls.projectLeadId.value == null || this.myForm.controls.projectLeadId.value === '') {
      alert('You must select a project lead');
      return;
    } else {
      return true;
    }
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    if (!this.isEditing) {
      // POST
      let project = new Project(
        this.convertFormToProject(this.myForm)
      );
      console.log('POSTing', project);
      this.projectService.add(project)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          (data) => {
            this.projectId = data._id;
          },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t create project');
          },
          () => { // onCompleted
            this.clearStorageService();
            this.loading = false;
            this.openSnackBar('This project was created successfuly.', 'Close');
            this.router.navigate(['/p', this.projectId, 'project-details']);
          }
        );
    } else {
      // PUT
      let project = new Project(this.convertFormToProject(this.myForm));
      console.log('PUTing', project);
      project._id = this.project._id;
      this.projectService.save(project)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { // onCompleted
            this.clearStorageService();
            this.loading = false;
            this.router.navigated = false;
            this.openSnackBar('This project was edited successfully.', 'Close');
            this.router.navigate(['/p', this.project._id, 'project-details']);
          },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t edit project');
          },
        );
    }
  }

  public removeSelectedOrganization() {
    this.storageService.state.selectedOrganization = null;
    this.proponentName = '';
    this.proponentId = '';
    this.myForm.controls.proponent.setValue('');
  }

  public linkContact(type) {
    this.setNavigation();
    this.storageService.state.tableColumns = [
      {
        name: 'Name',
        value: 'displayName',
        width: 'col-3'
      },
      {
        name: 'Organization',
        value: 'orgName',
        width: 'col-3'
      },
      {
        name: 'Email',
        value: 'email',
        width: 'col-3'
      },
      {
        name: 'Phone Number',
        value: 'phoneNumber',
        width: 'col-3'
      }
    ];
    this.storageService.state.sortBy = '+displayName';
    this.storageService.state.form = this.myForm;
    switch (type) {
      case 'epd': {
        this.storageService.state.selectedContactType = 'epd';
        break;
      }
      case 'lead': {
        this.storageService.state.selectedContactType = 'lead';
        break;
      }
      default: {
        return;
      }
    }

    this.storageService.state.componentModel = 'User';
    this.storageService.state.rowComponent = ContactSelectTableRowsComponent;
    if (this.isEditing) {
      this.router.navigate(['/p', this.storageService.state.currentProject.data._id, 'edit', 'link-contact', { pageSize: 25 }]);
    } else {
      this.router.navigate(['/projects', 'add', 'link-contact', { pageSize: 25 }]);
    }
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  register(myForm: FormGroup) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
