import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Subject, Observable } from 'rxjs';
import { Utils } from 'app/shared/utils/utils';
import { MatSnackBar } from '@angular/material';
import * as _ from 'lodash';

import { StorageService } from 'app/services/storage.service';
import { ConfigService } from 'app/services/config.service';
import { ProjectService } from 'app/services/project.service';
import { Project, ProjectPublishState } from 'app/models/project';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ContactSelectTableRowsComponent } from 'app/shared/components/contact-select-table-rows/contact-select-table-rows.component';
import { ISearchResults } from 'app/models/search';
import { FullProject } from 'app/models/fullProject';

import { Constants } from 'app/shared/utils/constants';

import { flatMap } from 'rxjs/operators';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { DialogService } from 'ng2-bootstrap-modal';

@Component({
  selector: 'form-tab-2002',
  templateUrl: './form-tab-2002.component.html',
  styleUrls: ['../add-edit-project.component.scss']
})
export class FormTab2002Component implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public myForm: FormGroup;
  public documents: any[] = [];
  public back: any = {};
  public regions: any[] = [];
  public sectorsSelected = [];
  public projectPhases: Array<any> = [];
  public proponentName = '';
  public proponentId = '';
  public legislationYear: Number = 2002;
  public ceaaInvolvements: Array<any> = [];
  public eacDecisions: Array<any> = [];

  public PROJECT_SUBTYPES = Constants.PROJECT_SUBTYPES(this.legislationYear);

  public PROJECT_TYPES = Constants.PROJECT_TYPES(this.legislationYear);

  public PROJECT_STATUS = Constants.PROJECT_STATUS(this.legislationYear);

  public PROJECT_NATURE = Constants.PROJECT_NATURE(this.legislationYear);
  public PROJECT_NATURE_OBJECT = Constants.buildToNature;
  public EA_READINESS_TYPES = Constants.EA_READINESS_TYPES(this.legislationYear);

  public projectName: string;
  public projectId: string;

  public tabIsEditing = false;
  public pageIsEditing = false;
  public project: Project;
  public fullProject: FullProject;
  public publishedLegislation: string;

  public loading = true;
  public published: boolean;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private configService: ConfigService,
    private _changeDetectorRef: ChangeDetectorRef,
    private utils: Utils,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private storageService: StorageService,
    private dialogService: DialogService,
  ) {
  }

  ngOnInit() {
    this.regions = this.configService.regions;

    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: { fullProject: ISearchResults<FullProject>[] }) => {
        this.initProject(data);
        this.initOrg();
        this.buildForm();
        this.initContacts();
        this.getLists();

        this.loading = false;
        try {
          this._changeDetectorRef.detectChanges();
        } catch (e) {
          // console.log('e:', e);
        }
      });

    this.back = this.storageService.state.back;
  }

  initProject(data: { fullProject: ISearchResults<FullProject>[] }) {
    const fullProjectSearchData = this.utils.extractFromSearchResults(data.fullProject);
    this.fullProject = fullProjectSearchData ? fullProjectSearchData[0] : null;
    if (this.fullProject) {
      // Need to also check if these keys are non empty. Not just if the key is null. For 96 the 2002 case is being hit which is causing
      if (this.fullProject['legislation_2002'] && Object.keys(this.fullProject['legislation_2002']).length > 0 && this.fullProject['legislation_2002'].name) {

        this.project = this.fullProject['legislation_2002'];
      } else {
        // 1996 so update legislation year aswell
        this.legislationYear = 1996;
        this.project = this.fullProject['legislation_1996'];
      }
      this.publishedLegislation =  this.fullProject.currentLegislationYear.toString();
      this.tabIsEditing =  !this.utils.isEmptyObject(this.project) && ('name' in this.project && this.project.name !== '');
      this.pageIsEditing = this.storageService.state.pageIsEditing;
      this.projectId = this.fullProject._id;
      this.projectName = this.tabIsEditing ? this.project.name : this.storageService.state.projectDetailName;
      this.published = this.fullProject.read.includes('public') && ['legislation_1996', 'legislation_2002'].includes(this.fullProject.currentLegislationYear);
    } else {
      this.published = false;
      this.pageIsEditing = false;
      this.tabIsEditing = false;
    }
  }
  initContacts() {
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
  }

  initOrg() {
    // selectedOrganization is the default, we need legislation-tab specific keys
    if (this.storageService.state.selectedOrganization2002) {
      // tab specific state set
      this.proponentName = this.storageService.state.selectedOrganization2002.name;
      this.proponentId = this.storageService.state.selectedOrganization2002._id;
    } else if (this.storageService.state.selectedOrganization) {
      // new organization linked, set tab-specific state
      this.storageService.state.selectedOrganization2002 = this.storageService.state.selectedOrganization;
      this.storageService.state.selectedOrganization = null;
      this.proponentName = this.storageService.state.selectedOrganization2002.name;
      this.proponentId = this.storageService.state.selectedOrganization2002._id;
    } else if (this.tabIsEditing && this.project.proponent && this.project.proponent._id) {
      // load from data
      this.proponentName = this.project.proponent.name;
      this.proponentId = this.project.proponent._id;
    }
  }

  buildForm() {
    // using multiple forms now one per legislation
    if (this.storageService.state.form2002) {
      // TODO: Save the projectID if it was originally an edit.
      this.myForm = this.storageService.state.form2002;
      this.onChangeType();
    } else if (this.tabIsEditing) {
      // First entry on resolver
      this.myForm = this.buildFormFromData(this.project);
      this.onChangeType();
    } else {
      this.myForm = new FormGroup({
        'name': new FormControl(),
        'proponent': new FormControl(),
        'currentPhaseName': new FormControl(this.projectPhases[0]),
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
        'eacDecision': new FormControl(this.eacDecisions[0]),
        'decisionDate': new FormControl(),
        'substantially': new FormControl(),
        'substantiallyDate': new FormControl(),
        'activeStatus': new FormControl(),
        'activeDate': new FormControl(),
        'responsibleEPDId': new FormControl(),
        'responsibleEPD': new FormControl(),
        'projectLeadId': new FormControl(),
        'projectLead': new FormControl(),
      });
    }}

  private setNavigation() {
    if (!this.pageIsEditing) {
      this.navigationStackUtils.pushNavigationStack(
        ['/projects', 'add', 'form-2002'],
        [
          {
            route: ['/projects'],
            label: 'All Projects'
          },
          {
            route: ['/projects', 'add', 'form-2002'],
            label: 'Add'
          }
        ]
      );
    } else {
      this.navigationStackUtils.pushNavigationStack(
        ['/p', this.projectId, 'edit', 'form-2002'],
        [
          {
            route: ['/projects'],
            label: 'All Projects'
          },
          {
            route: ['/p', this.projectId],
            label: this.projectName
          },
          {
            route: ['/p', this.projectId, 'edit', 'form-2002'],
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
      'currentPhaseName': new FormControl(formData.currentPhaseName ? formData.currentPhaseName._id : ''),
      'sector': new FormControl(formData.sector),
      'description': new FormControl(formData.description),
      'location': new FormControl(formData.location),
      'region': new FormControl(formData.region),
      'lat': new FormControl(formData.centroid[1]),
      'lon': new FormControl(formData.centroid[0]),
      'addFile': new FormControl(formData.addFile),
      'CEAAInvolvement': new FormControl(formData.CEAAInvolvement && formData.CEAAInvolvement._id || null),
      'CEAALink': new FormControl(formData.CEAALink),
      'ea': new FormControl(formData.ea),
      'capital': new FormControl(formData.intake.investment),
      'notes': new FormControl(formData.intake.investmentNotes),
      'eaStatus': new FormControl(formData.eaStatus),
      'eaStatusDate': new FormControl(),
      'status': new FormControl(formData.status || this.PROJECT_STATUS[2]),
      'projectStatusDate': new FormControl(),
      'eacDecision': new FormControl(formData.eacDecision && formData.eacDecision._id || this.eacDecisions[0]),
      'decisionDate': new FormControl(this.utils.convertJSDateToNGBDate(new Date(formData.decisionDate))),
      'substantially': new FormControl(formData.substantially),
      'substantiallyDate': new FormControl(),
      'activeStatus': new FormControl(formData.activeStatus),
      'activeDate': new FormControl(),
      'responsibleEPDId': new FormControl(formData.responsibleEPDObj._id),
      'responsibleEPD': new FormControl(formData.responsibleEPDObj.displayName),
      'projectLeadId': new FormControl(formData.projectLeadObj._id),
      'projectLead': new FormControl(formData.projectLeadObj.displayName),
      // 'review180Start': new FormControl(this.utils.convertJSDateToNGBDate(new Date(formData.review180Start))),
      // 'review45Start': new FormControl(this.utils.convertJSDateToNGBDate(new Date(formData.review45Start)))
    });
    this.sectorsSelected = this.PROJECT_SUBTYPES[formData.type];
    return theForm;
  }

  onChangeType() {
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

  isNatureSelected(val) {
    if (this.myForm.controls.build.value === val) {
      return true;
    } else {
      return false;
    }
  }

  private getDecisionDate(value) {
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
      'currentPhaseName': form.controls.currentPhaseName.value,
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
      'decisionDate': this.getDecisionDate(form.get('decisionDate').value),
      'substantially': form.controls.substantially.value === 'yes' ? true : false,
      // 'substantiallyDate': form.get('substantiallyDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('substantiallyDate').value))).toISOString() : null,
      'activeStatus': form.controls.activeStatus.value,
      // 'activeDate': form.get('activeDate').value ? new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('activeDate').value))).toISOString() : null,
      'responsibleEPDId': form.controls.responsibleEPDId.value,
      'projectLeadId': form.controls.projectLeadId.value,
      // extension stuff
      // 'review180Start': this.getDate(form.get('review180Start').value),
      // 'review45Start': this.getDate(form.get('review45Start').value)
    };
  }

  private clearStorageService() {
    // this.storageService.state.extension = null;
    // this.storageService.state.extensionType = null;
    this.storageService.state.form2002 = null;
    this.storageService.state.selectedOrganization2002 = null;
    this.storageService.state.selectedOrganization = null;
    this.navigationStackUtils.popNavigationStack();
  }

  public linkOrganization() {
    // Safe way to clear out .add
    this.storageService.state.add = null;
    this.storageService.state.form2002 = this.myForm;
    this.setNavigation();
    if (!this.pageIsEditing) {
      this.router.navigate(['/projects', 'add', 'form-2002' , 'link-org']);
    } else {
      this.router.navigate(['/p', this.projectId, 'edit', 'form-2002', 'link-org']);
    }
  }

  public validateForm() {
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
    } else if (this.myForm.controls.currentPhaseName.value === '') {
      alert('You must select a project phase.');
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
      return false;
    }  else if (this.myForm.controls.eacDecision.value === '' || this.myForm.controls.eacDecision.value === null) {
      alert('You must select an EA Decision');
      return false;
    } else {
      return true;
    }
  }

  setGlobalProjectPublishFlag(state: ProjectPublishState) {
    this.storageService.state['projectPublishState_' + this.projectId] = state;
  }

  confirmGuard(message: string): Observable<boolean> {
    return this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm Action',
        message: message,
        okOnly: false
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      });
  }

  onUnpublish(): void {
    this.confirmGuard(`Are you sure you want to <strong>Un-Publish</strong> this project entirely?`)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (confirmation: boolean) => {
          if (confirmation) {
            this.projectService.unPublish({
              ...this.project,
              _id: this.fullProject._id
            }).takeUntil(this.ngUnsubscribe)
              .subscribe(
                () => { // onNext
                },
                error => {
                  console.log('error =', error);
                  this.snackBar.open('Uh-oh, couldn\'t un-publish project', 'Close');
                },
                () => { // onCompleted
                  this.published = false;
                  this.snackBar.open('Project un-published...', null, { duration: 2000 });
                  this.setGlobalProjectPublishFlag(ProjectPublishState.unpublished);
                  this.router.navigate(['/p', this.projectId, 'project-details']);
                }
              );
          }
        }
      );

  }

  onPublish(): void {
    this.confirmGuard(`Are you sure you want to <strong>Publish</strong> this project under the <strong>${this.project.legislation}</strong>?`)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (confirmation: boolean) => {
          if (confirmation) {
            this.saveProject(
              // POST
              (project: Project): Observable<Project> => {
                this.clearStorageService();
                return this.projectService.publish(project);
              },
              // PUT
              (project: Project): Observable<Project> => {
                this.clearStorageService();
                return this.projectService.publish(project);

              },
              // POST SUBSCRIBE
              [
                (data) => {
                  this.projectId = data._id;
                },
                () => {
                },
                () => {
                  this.published = true;
                  this.loading = false;
                  this.openSnackBar('This project was created and published successfuly.', 'Close');
                  this.setGlobalProjectPublishFlag(ProjectPublishState.published2002);
                  this.router.navigate(['/p', this.projectId, 'project-details']);
                }
              ],
              // PUT SUBSCRIBE
              [
                () => {
                },
                () => {
                },
                () => {
                  this.published = true;
                  this.loading = false;
                  this.router.navigated = false;
                  this.openSnackBar('This project was edited and published successfuly.', 'Close');
                  this.setGlobalProjectPublishFlag(ProjectPublishState.published2002);
                  this.router.navigate(['/p', this.projectId, 'project-details']);
                }
              ]
            );
          }
        }
      );
  }
  // TODO: don't lose this

  saveProject(postFunction: (_: Project) => Observable<Project>, putFunction: (_: Project) => Observable<Project>,
    postSubscribe: ((_: any) => void)[], putSubscribe: ((_: any) => void)[]): void {

    if (!this.validateForm()) {
      return;
    }
    if (!this.pageIsEditing) {
      // POST
      let project = new Project(
        this.convertFormToProject(this.myForm)
      );

      if (postFunction) {
        // currently ignored, doesn't match 2018 save process?
        // why are these different at all, why not use a controller for both?
      }

      this.projectService.add(project)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          ...postSubscribe
        );
    } else {
      // PUT
      // need to add on legislation year so that we can know where to put it on the root object
      let project = (new Project({
        ...this.convertFormToProject(this.myForm),
        legislationYear: this.legislationYear,
        _id: this.projectId
      }));
      if (putFunction) {
        this.projectService.save(project)
          .takeUntil(this.ngUnsubscribe).pipe(flatMap(__ => putFunction(project) ))
          .subscribe(
            ...putSubscribe
          );
      } else {
        this.projectService.save(project)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            ...putSubscribe
          );
      }
    }
  }

  onSubmit(): void {
    this.saveProject(
      null,
      null,
      // POST SUBSCRIBE
      [
        (data) => {
          this.projectId = data._id;
        },
        () => {
        },
        () => {
          this.clearStorageService();
          this.loading = false;
          this.openSnackBar('This project was created successfuly.', 'Close');
          this.router.navigate(['/p', this.projectId, 'project-details']);
        }
      ],
      // PUT SUBSCRIBE
      [
        () => {
        },
        () => {
        },
        () => {
          this.clearStorageService();
          this.loading = false;
          this.router.navigated = false;
          this.openSnackBar('This project was edited successfully.', 'Close');
        }
      ]
    );
  }

  public removeSelectedOrganization() {
    this.storageService.state.selectedOrganization2002 = null;
    this.storageService.state.selectedOrganization = null;
    this.proponentName = '';
    this.proponentId = '';
    this.myForm.controls.proponent.setValue('');
  }

  public linkContact(type) {
    this.setNavigation();
    this.storageService.state.sortBy = '+displayName';
    this.storageService.state.form2002 = this.myForm;
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
    if (this.tabIsEditing) {
      this.router.navigate(['/p', this.storageService.state.currentProject.data._id, 'edit', 'form-2002' , 'link-contact', { pageSize: 25 }]);
    } else {
      this.router.navigate(['/projects', 'add', 'form-2002', 'link-contact', { pageSize: 25 }]);
    }
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  register() { }

  getLists() {
    // List values only have 2002 and 2018 values.
    // If a project is set to 1996 legislation, make sure
    // to load the 2002 codes.
    let tempLegislationYear = this.legislationYear === 1996 ? 2002 : this.legislationYear;

    this.configService.lists.forEach(item => {
      switch (`${item.type}|${item.legislation}`) {
        case `eaDecisions|${tempLegislationYear}`:
          this.eacDecisions.push({ ...item });
          break;
        case `ceaaInvolvements|${tempLegislationYear}`:
          this.ceaaInvolvements.push({ ...item });
          break;
        case `projectPhase|${tempLegislationYear}`:
          this.projectPhases.push({ ...item});
          break;
        default:
          break;
      }
    });

    // Sorts by legislation first and then listOrder for each legislation group.
    this.eacDecisions = _.sortBy(this.eacDecisions, ['legislation', 'listOrder']);
    this.ceaaInvolvements = _.sortBy(this.ceaaInvolvements, ['legislation', 'listOrder']);
    this.projectPhases = _.sortBy(this.projectPhases, ['legislation', 'listOrder']);
  }

  ngOnDestroy() {
    // save state before destructing, helps with switching tabs
    this.storageService.state.form2002 = this.myForm;
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
