import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Subject, Observable } from 'rxjs';
import { Utils } from 'app/shared/utils/utils';
import { MatSnackBar } from '@angular/material';

import { StorageService } from 'app/services/storage.service';
import { ConfigService } from 'app/services/config.service';
import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ContactSelectTableRowsComponent } from 'app/shared/components/contact-select-table-rows/contact-select-table-rows.component';
import { ISearchResults } from 'app/models/search';
import { FullProject } from 'app/models/fullProject';
import { flatMap } from 'rxjs/operators';

@Component({
  selector: 'form-tab-2018',
  templateUrl: './form-tab-2018.component.html',
  styleUrls: ['../add-edit-project.component.scss']
})
export class FormTab2018Component implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public myForm: FormGroup;
  public documents: any[] = [];
  public back: any = {};
  public regions: any[] = [];
  public sectorsSelected = [];
  public proponentName = '';
  public proponentId = '';

  public PROJECT_SUBTYPES: Object = {
    'Mines': [
      'Coal Mines',
      'Construction Stone and Industrial Mineral Quarries',
      'Mineral Mines',
      'Off-shore Mines',
      'Placer Mineral Mines',
      'Sand and Gravel Pits'
    ],
    'Energy-Electricity': [
      'Electric Transmission Lines',
      'Power Plants'
    ],
    'Energy-Petroleum & Natural Gas': [
      'Energy Storage Facilities',
      'Natural Gas Processing Plants',
      'Off-shore Oil or Gas Facilities',
      'Oil Refineries',
      'Transmission Pipelines'
    ],
    'Transportation': [
      'Airports',
      'Ferry Terminals',
      'Marine Port Projects',
      'Public Highways',
      'Railways'
    ],
    'Water Management': [
      'Dams',
      'Dykes',
      'Groundwater Extraction',
      'Shoreline Modification',
      'Water Diversion'
    ],
    'Industrial': [
      'Forest Products Industries',
      'Non-metallic Mineral Products Industries',
      'Organic and Inorganic Chemical Industry',
      'Other Industries',
      'Primary Metals Industry'
    ],
    'Hazardous Waste Management': [
      'Hazardous Waste Facilities',
      'Local Government Liquid Waste Management Facilities',
      'Solid Waste Management'
    ],
    'Tourist Destination Resorts': [
      'Golf Resorts',
      'Marina Resorts',
      'Resort Developments',
      'Ski Resorts'
    ],
    'Other': [
      'Other'
    ]
  };

  public PROJECT_TYPES: Array<Object> = [
    'Energy-Electricity',
    'Energy-Petroleum & Natural Gas',
    'Industrial',
    'Mines',
    'Other',
    'Tourist Destination Resorts',
    'Transportation',
    'Hazardous Waste Management',
    'Water Management'
  ];

  public PROJECT_STATUS: Array<Object> = [
    'Minister\'s Designation',
    'Early Engagement',
    'EA Readiness Decision',
    'Process Planning',
    'Application Development & Review',
    'Effects Assessment',
    'Referral',
    'Dispute Resolution',
    'Post Decision - Pre-Construction',
    'Post Decision - Construction',
    'Post Decision - Operation',
    'Post Decision - Care & Maintenance',
    'Post Decision - Decommission',
    'Post Decision - Amendment',
    'Post Decision - Substantial Start',
    'Post Decision - EAC Extension',
    'Post Decision - Suspension',
    'Complete',
    'Other'
  ];

  public PROJECT_NATURE: Array<Object> = [
    'New Construction',
    'Modification of Existing',
    'Dismantling or Abandonment'
  ];

  public EAC_DECISIONS: Array<Object> = [
    'Project Designated Non-Reviewable',
    'Exemption Order',
    'Readiness Termination',
    'In Progress',
    'Assessment Terminated',
    'Application Withdrawn',
    'Certificate Issued',
    'Certificate Refused',
    'Certificate Expired',
    'Certificate Cancelled',
    'Exemption Order Rescinded',
    'Certificate Reinstated',
    'Certificate End of Life'
  ];

  public projectName: string;
  public projectId: string;
  public project: Project;
  public oldProject: Project;

  public tabIsEditing = false;
  public pageIsEditing = false;

  public fullProject: FullProject;
  public legislationYear: Number = 2018;
  public publishedLegislation: string;

  public loading = true;
  public published: boolean;
  public only2018: boolean;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private config: ConfigService,
    private _changeDetectorRef: ChangeDetectorRef,
    private utils: Utils,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private storageService: StorageService,
  ) {
  }

  ngOnInit() {
    // This is to get Region information from List (db) and put into a list(regions)
    this.config.getRegions().takeUntil(this.ngUnsubscribe).subscribe(
      (data) => {
        this.regions = data;
      }
    );

    // Get data related to current project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      // Mapping the get People object observable here to fill out the epd and lead objects
      .flatMap(data => this.projectService.getPeopleObjs(data, ['legislation_2018']))
      .subscribe((data: { fullProject: ISearchResults<FullProject>[] }) => {
        this.initProject(data);
        this.initOrg();


        this.buildForm();
        this.initContacts();

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
      this.oldProject = this.fullProject['legislation_2002'] || this.fullProject['legislation_1996'];
      this.project = this.fullProject['legislation_2018'];
      this.publishedLegislation =  this.fullProject.currentLegislationYear.toString();
      this.tabIsEditing = !this.utils.isEmptyObject(this.project);
      this.pageIsEditing = this.storageService.state.pageIsEditing;
      this.projectId = this.fullProject._id;
      this.projectName = this.tabIsEditing ? this.project.name : this.storageService.state.projectDetailName;
      this.published = this.fullProject.read.includes('public') && ['legislation_2018'].includes(this.fullProject.currentLegislationYear);
    } else {
      this.published = false;
      this.pageIsEditing = false;
      this.tabIsEditing = false;
    }
    this.check2018();
  }

  initOrg() {
    if (this.storageService.state.selectedOrganization2018) {
      // tab specific state set
      this.proponentName = this.storageService.state.selectedOrganization2018.name;
      this.proponentId = this.storageService.state.selectedOrganization2018._id;
    } else if (this.storageService.state.selectedOrganization) {
      // new organization linked, set tab-specific state
      this.storageService.state.selectedOrganization2018 = this.storageService.state.selectedOrganization;
      this.storageService.state.selectedOrganization = null;
      this.proponentName = this.storageService.state.selectedOrganization2018.name;
      this.proponentId = this.storageService.state.selectedOrganization2018._id;
    } else if (this.tabIsEditing && this.project.proponent && this.project.proponent._id !== '') {
      // load from data
      this.proponentName = this.project.proponent.name;
      this.proponentId = this.project.proponent._id;
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

  autofill() {
    this.myForm = this.buildFormFromData(this.oldProject);
  }

  buildForm() {
    if (this.storageService.state.form2018) {
      // TODO: Save the projectID if it was originally an edit.
      this.myForm = this.storageService.state.form2018;
      this.onChangeType(null);
    } else if (this.tabIsEditing) {
      // First entry on resolver
      this.myForm = this.buildFormFromData(this.project);
      this.onChangeType(null);
    } else {
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
        'status': new FormControl(),
        'projectStatusDate': new FormControl(),
        'eacDecision': new FormControl(),
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
    }
  }

  private setNavigation() {
    if (!this.pageIsEditing) {
      this.navigationStackUtils.pushNavigationStack(
        ['/projects', 'add', 'form-2018'],
        [
          {
            route: ['/projects'],
            label: 'All Projects'
          },
          {
            route: ['/projects', 'add', 'form-2018'],
            label: 'Add'
          }
        ]
      );
    } else {
      this.navigationStackUtils.pushNavigationStack(
        ['/p', this.projectId, 'edit', 'form-2018'],
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
            route: ['/p', this.projectId, 'edit', 'form-2018'],
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
      'status': new FormControl(formData.status),
      'projectStatusDate': new FormControl(),
      'eacDecision': new FormControl(formData.eacDecision),
      'decisionDate': new FormControl(this.utils.convertJSDateToNGBDate(new Date(formData.decisionDate))),
      'substantially': new FormControl(formData.substantially),
      'substantiallyDate': new FormControl(),
      'activeStatus': new FormControl(formData.activeStatus),
      'activeDate': new FormControl(),
      'responsibleEPDId': new FormControl(formData.responsibleEPDObj._id),
      'responsibleEPD': new FormControl(formData.responsibleEPDObj.displayName),
      'projectLeadId': new FormControl(formData.projectLeadObj._id),
      'projectLead': new FormControl(formData.projectLeadObj.displayName),
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
    this.buildForm();
    // if (this.back && this.back.url) {
    //   this.router.navigate(this.back.url);
    // } else {
    //   this.router.navigate(['/projects']);
    // }
  }

  isSelected(val) {
    if (this.myForm.controls.build.value === val) {
      return true;
    } else {
      return false;
    }
  }

  check2018() {
    if (this.fullProject.legislationYearList.length === 1 && this.fullProject.legislationYearList[0] === 2018) {
      this.only2018 = true;
    } else {
      this.only2018 = false;
    }
  }

  isEACSelected(val) {
    if (this.myForm.controls.eaStatus.value === val) {
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
    };
  }

  private clearStorageService() {
    this.storageService.state.form2018 = null;
    this.storageService.state.selectedOrganization2018 = null;
    // this.storageService.state.selectedOrganization = null;
    // this.navigationStackUtils.popNavigationStack();
  }

  public linkOrganization() {
    this.storageService.state.form2018 = this.myForm;
    this.setNavigation();
    if (!this.pageIsEditing) {
      this.router.navigate(['/projects', 'add', 'form-2018', 'link-org']);
    } else {
      this.router.navigate(['/p', this.projectId, 'edit', 'form-2018', 'link-org']);
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
      return;
    } else if (this.myForm.controls.responsibleEPDId.value == null || this.myForm.controls.responsibleEPDId.value === '') {
      alert('You must select an EPD');
      return;
    } else if (this.myForm.controls.projectLeadId.value == null || this.myForm.controls.projectLeadId.value === '') {
      alert('You must select a project lead');
      return;
    } else {
      return true;
    }
  }

  onUnpublish(): void {
    this.projectService.unPublish({
      ...this.project,
      _id: this.fullProject._id
    }).takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data) => { // onNext
        },
        error => {
          console.log('error =', error);
          this.snackBar.open('Uh-oh, couldn\'t un-publish project', 'Close');
        },
        () => { // onCompleted
          this.published = false;
          this.snackBar.open('Project un-published...', null, { duration: 2000 });
          this.router.navigate(['/p', this.projectId, 'project-details']);
        }
      );
  }

  onPublish(): void {
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
        (error) => {
        },
        () => {
          this.published = true;
          this.loading = false;
          this.openSnackBar('This project was created and published successfuly.', 'Close');
          this.router.navigate(['/p', this.projectId, 'project-details']);
        }
      ],
      // PUT SUBSCRIBE
      [
        (data) => {
        },
        (error) => {
        },
        () => {
          this.published = true;
          this.loading = false;
          this.router.navigated = false;
          this.openSnackBar('This project was edited and published successfuly.', 'Close');
          this.router.navigate(['/p', this.projectId, 'project-details']);
        }
      ]
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
      // Make sure to add the legislationYear to the project
      let project = new Project(
        {
          ...this.convertFormToProject(this.myForm),
          legislationYear: this.legislationYear
        }
      );
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
        .takeUntil(this.ngUnsubscribe).pipe(flatMap(_ => putFunction(project) ))
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
        (error) => {
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
        (data) => {
        },
        (error) => {
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
    this.storageService.state.selectedOrganization2018 = null;
    this.storageService.state.selectedOrganization = null;
    this.proponentName = '';
    this.proponentId = '';
    this.myForm.controls.proponent.setValue('');
  }

  public linkContact(type) {
    this.setNavigation();
    this.storageService.state.sortBy = '+displayName';
    this.storageService.state.form2018 = this.myForm;
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
      this.router.navigate(['/p', this.storageService.state.currentProject.data._id, 'edit', 'form-2018', 'link-contact', { pageSize: 25 }]);
    } else {
      this.router.navigate(['/projects', 'add', 'form-2018', 'link-contact', { pageSize: 25 }]);
    }
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  register(myForm: FormGroup) { }

  ngOnDestroy() {
    // save state before destructing, helps with switching tabs
    this.storageService.state.form2018 = this.myForm;
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
