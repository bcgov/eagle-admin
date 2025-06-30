import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import moment from 'moment-timezone';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { FullProject } from 'src/app/models/fullProject';
import { Project, ProjectPublishState } from 'src/app/models/project';
import { ISearchResults } from 'src/app/models/search';
import { ConfigService } from 'src/app/services/config.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ContactSelectTableRowsComponent } from 'src/app/shared/components/contact-select-table-rows/contact-select-table-rows.component';
import { Constants } from 'src/app/shared/utils/constants';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { Utils } from 'src/app/shared/utils/utils';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'form-tab-2018',
  templateUrl: './form-tab-2018.component.html',
  styleUrls: ['../add-edit-project.component.scss']
})
export class FormTab2018Component implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  public myForm: UntypedFormGroup;
  public documents: any[] = [];
  public back: any = {};
  public regions: any[] = [];
  public sectorsSelected = [];
  public projectPhases: Array<any> = [];
  public proponentName = '';
  public proponentId = '';
  public ceaaInvolvements: Array<any> = [];
  public eacDecisions: Array<any> = [];

  public projectName: string;
  public projectId: string;
  public project: Project;
  public oldProject: Project;

  public tabIsEditing = false;
  public pageIsEditing = false;

  public fullProject: FullProject;
  public legislationYear = 2018;
  public publishedLegislation: string;

  public PROJECT_SUBTYPES = Constants.PROJECT_SUBTYPES(this.legislationYear);

  public PROJECT_TYPES = Constants.PROJECT_TYPES(this.legislationYear);

  public PROJECT_STATUS = Constants.PROJECT_STATUS(this.legislationYear);

  public PROJECT_NATURE = Constants.PROJECT_NATURE(this.legislationYear);

  public EA_READINESS_TYPES = Constants.EA_READINESS_TYPES(this.legislationYear);

  public PROJECT_NATURE_OBJECT = Constants.buildToNature;
  public loading = true;
  public published: boolean;
  public only2018: boolean;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private configService: ConfigService,
    private modalService: NgbModal,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private utils: Utils,
  ) {
  }

  ngOnInit() {
    // This is to get Region information from List (db) and put into a list(regions)
    this.regions = this.configService.regions;

    this.subscriptions.add(
      this.route.parent.data
        .subscribe((data: { fullProject: ISearchResults<FullProject>[] }) => {
          this.initProject(data);
          this.initOrg();
          this.getLists();

          this.buildForm();
          this.initContacts();

          this.loading = false;
          try {
            this._changeDetectorRef.detectChanges();
          } catch (e) {
            // console.log('e:', e);
          }
        })
    );

    this.back = this.storageService.state.back;
  }

  initProject(data: { fullProject: ISearchResults<FullProject>[] }) {
    const fullProjectSearchData = this.utils.extractFromSearchResults(data.fullProject);
    this.fullProject = fullProjectSearchData ? fullProjectSearchData[0] : null;
    if (this.fullProject) {
      if (this.fullProject['legislation_2002'] && Object.keys(this.fullProject['legislation_2002']).length > 0 && this.fullProject['legislation_2002'].name) {
        this.oldProject = this.fullProject['legislation_2002'];
      } else {
        this.oldProject = this.fullProject['legislation_1996'];
      }
      this.project = this.fullProject['legislation_2018'];
      this.publishedLegislation = this.fullProject.currentLegislationYear.toString();
      // When we save the project legislation_2018 is saved to the database with no values in each key. So our isEditing logic is not working properly. Need to check the name key on project aswell
      // tslint:disable-next-line: triple-equals
      this.tabIsEditing = !this.utils.isEmptyObject(this.project) && ('name' in this.project && this.project.name !== '');
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
      this.myForm = this.storageService.state.form2018;
      this.onChangeType();
    } else if (!this.tabIsEditing && !this.only2018) {
      this.autofill();
    } else if (this.tabIsEditing) {
      // First entry on resolver
      this.myForm = this.buildFormFromData(this.project);
      this.onChangeType();
    } else {
      this.myForm = new UntypedFormGroup({
        'name': new UntypedFormControl(),
        'proponent': new UntypedFormControl(),
        'currentPhaseName': new UntypedFormControl(this.projectPhases[0]),
        'build': new UntypedFormControl(),
        'type': new UntypedFormControl(),
        'sector': new UntypedFormControl(),
        'description': new UntypedFormControl(),
        'location': new UntypedFormControl(),
        'region': new UntypedFormControl(),
        'lat': new UntypedFormControl([]),
        'lon': new UntypedFormControl([]),
        'addFile': new UntypedFormControl(),
        'CEAAInvolvement': new UntypedFormControl(),
        'CEAALink': new UntypedFormControl(),
        'ea': new UntypedFormControl(),
        'capital': new UntypedFormControl(),
        'notes': new UntypedFormControl(),
        'eaStatus': new UntypedFormControl(),
        'eaStatusDate': new UntypedFormControl(),
        'status': new UntypedFormControl(),
        'projectStatusDate': new UntypedFormControl(),
        'eacDecision': new UntypedFormControl(),
        'decisionDate': new UntypedFormControl(),
        'substantially': new UntypedFormControl(),
        'substantiallyDate': new UntypedFormControl(),
        'dispute': new UntypedFormControl(),
        'disputeDate': new UntypedFormControl(),
        'activeStatus': new UntypedFormControl(),
        'activeDate': new UntypedFormControl(),
        'responsibleEPDId': new UntypedFormControl(),
        'responsibleEPD': new UntypedFormControl(),
        'projectLeadId': new UntypedFormControl(),
        'projectLead': new UntypedFormControl(),
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
      const theRegion = this.regions.filter((region: any) => {
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

    if (!formData.substantiallyDate) {
      formData.substantiallyDate = '';
    } else {
      formData.substantiallyDate = this.utils.convertJSDateToNGBDate(new Date(formData.substantiallyDate));
    }

    if (!formData.dispute) {
      formData.dispute = 'no';
    } else {
      formData.dispute = 'yes';
    }

    if (!formData.disputeDate) {
      formData.disputeDate = '';
    } else {
      formData.disputeDate = this.utils.convertJSDateToNGBDate(new Date(formData.disputeDate));
    }

    if (!formData.eaStatusDate) {
      formData.eaStatusDate = '';
    } else {
      formData.eaStatusDate = this.utils.convertJSDateToNGBDate(new Date(formData.eaStatusDate));
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

    const theForm = new UntypedFormGroup({
      'name': new UntypedFormControl(formData.name),
      'proponent': new UntypedFormControl(formData.proponent),
      'build': new UntypedFormControl(formData.build),
      'type': new UntypedFormControl(formData.type),
      'currentPhaseName': new UntypedFormControl(formData.currentPhaseName ? formData.currentPhaseName._id : ''),
      'sector': new UntypedFormControl(formData.sector),
      'description': new UntypedFormControl(formData.description),
      'location': new UntypedFormControl(formData.location),
      'region': new UntypedFormControl(formData.region),
      'lat': new UntypedFormControl(formData.centroid[1]),
      'lon': new UntypedFormControl(formData.centroid[0]),
      'addFile': new UntypedFormControl(formData.addFile),
      'CEAAInvolvement': new UntypedFormControl(formData.CEAAInvolvement && formData.CEAAInvolvement._id || null),
      'CEAALink': new UntypedFormControl(formData.CEAALink),
      'ea': new UntypedFormControl(formData.ea),
      'capital': new UntypedFormControl(formData.intake.investment),
      'notes': new UntypedFormControl(formData.intake.investmentNotes),
      'eaStatus': new UntypedFormControl(formData.eaStatus),
      'eaStatusDate': new UntypedFormControl(formData.eaStatusDate),
      'status': new UntypedFormControl(formData.status),
      'projectStatusDate': new UntypedFormControl(),
      'eacDecision': new UntypedFormControl(formData.eacDecision && formData.eacDecision._id || null),
      'decisionDate': new UntypedFormControl(formData.decisionDate ? this.utils.convertJSDateToNGBDate(new Date(formData.decisionDate)) : null),
      'substantially': new UntypedFormControl(formData.substantially),
      'substantiallyDate': new UntypedFormControl(formData.substantiallyDate),
      'dispute': new UntypedFormControl(formData.dispute),
      'disputeDate': new UntypedFormControl(formData.disputeDate),
      'activeStatus': new UntypedFormControl(formData.activeStatus),
      'activeDate': new UntypedFormControl(),
      'responsibleEPDId': new UntypedFormControl(formData.responsibleEPDObj._id),
      'responsibleEPD': new UntypedFormControl(formData.responsibleEPDObj.displayName),
      'projectLeadId': new UntypedFormControl(formData.projectLeadObj._id),
      'projectLead': new UntypedFormControl(formData.projectLeadObj.displayName),
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
    this.buildForm();
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

  check2018() {
    this.only2018 =
      this.fullProject ?
        this.fullProject.legislationYearList.length === 1
        && this.fullProject.legislationYearList[0] === 2018
        : true;
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
      'eaStatusDate': form.get('eaStatusDate').value ? moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('eaStatusDate').value)).toDate().toISOString() : null,
      'status': form.controls.status.value,
      // 'projectStatusDate': form.get('projectStatusDate').value ? moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('projectStatusDate').value)).toDate().toISOString() : null,
      'eacDecision': form.controls.eacDecision.value,
      'decisionDate': form.get('decisionDate').value ? moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('decisionDate').value)).toDate().toISOString() : null,
      'substantially': form.controls.substantially.value === 'yes' ? true : false,
      'substantiallyDate': form.get('substantiallyDate').value ? moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('substantiallyDate').value)).toDate().toISOString() : null,
      'dispute': form.controls.dispute.value === 'yes' ? true : false,
      'disputeDate': form.get('disputeDate').value ? moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('disputeDate').value)).toDate().toISOString() : null,
      'activeStatus': form.controls.activeStatus.value,
      // 'activeDate': form.get('activeDate').value ? moment(this.utils.convertFormGroupNGBDateToJSDate(form.get('activeDate').value)).toDate().toISOString() : null,
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
    // Safe way to clear out .add
    this.storageService.state.add = null;
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
    } else if (this.myForm.controls.currentPhaseName.value === '') {
      alert('You must select a project phase.');
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
    } else if (this.myForm.controls.eacDecision.value === '' || this.myForm.controls.eacDecision.value === null) {
      alert('You must select an EA Decision');
      return;
    } else {
      return true;
    }
  }

  setGlobalProjectPublishFlag(state: ProjectPublishState) {
    this.storageService.state['projectPublishState_' + this.projectId] = state;
  }

  confirmGuard(message: string): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      backdropClass: 'custom-backdrop',
      centered: true
    });

    modalRef.componentInstance.title = 'Confirm Action';
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.okOnly = false;

    return new Observable<boolean>(observer => {
      modalRef.result.then(
        (result) => {
          observer.next(result === true);
          observer.complete();
        },
        () => {
          observer.next(false); // If dismissed, treat as "Cancel"
          observer.complete();
        }
      );
    });
  }

  onUnpublish(): void {
    this.subscriptions.add(
      this.confirmGuard(`Are you sure you want to <strong>Un-Publish</strong> this project entirely?`)
        .subscribe(
          (confirmation: boolean) => {
            if (confirmation) {
              this.subscriptions.add(
                this.projectService.unPublish({
                  ...this.project,
                  _id: this.fullProject._id
                })
                  .subscribe({
                    next: () => {
                      // onNext
                    },
                    error: (error) => {
                      console.log('error =', error);
                      this.snackBar.open('Uh-oh, couldn\'t un-publish project', 'Close');
                    },
                    complete: () => {
                      this.published = false;
                      this.snackBar.open('Project un-published...', null, { duration: 2000 });
                      this.setGlobalProjectPublishFlag(ProjectPublishState.unpublished);
                      this.router.navigate(['/p', this.projectId, 'project-details']);
                    }
                  })
              );
            }
          }
        )
    );
  }

  onPublish(): void {
    this.subscriptions.add(
      this.confirmGuard(`Are you sure you want to <strong>Publish</strong> this project under the <strong>2018 Environmental Assessment Act</strong>?`)
        .subscribe(
          (confirmation: boolean) => {
            if (confirmation) {
              this.saveProject(
                // POST
                (project: Project, apiRes: Project): Observable<Project> => {
                  this.clearStorageService();
                  project = { ...project, _id: apiRes._id };
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
                  null,
                  () => {
                    this.published = true;
                    this.loading = false;
                    this.openSnackBar('This project was created and published successfuly.', 'Close');
                    this.setGlobalProjectPublishFlag(ProjectPublishState.published2018);
                    this.router.navigate(['/p', this.projectId, 'project-details']);
                  }
                ],
                // PUT SUBSCRIBE
                [
                  null,
                  null,
                  () => {
                    this.published = true;
                    this.loading = false;
                    this.router.navigated = false;
                    this.openSnackBar('This project was edited and published successfuly.', 'Close');
                    this.setGlobalProjectPublishFlag(ProjectPublishState.published2018);
                    this.router.navigate(['/p', this.projectId, 'project-details']);
                  }
                ]
              );
            }
          }
        )
    );
  }
  // TODO: don't lose this

  saveProject(postFunction: (_: Project, apiRes: Project) => Observable<Project>, putFunction: (_: Project) => Observable<Project>,
    postSubscribe: ((_: any) => void)[], putSubscribe: ((_: any) => void)[]): void {

    if (!this.validateForm()) {
      return;
    }
    if (!this.pageIsEditing) {
      // POST
      // Make sure to add the legislationYear to the project
      const project = new Project(
        {
          ...this.convertFormToProject(this.myForm),
          legislationYear: this.legislationYear
        }
      );
      if (postFunction) {
        this.subscriptions.add(
          this.projectService.add(project)
            .pipe(
              switchMap(apiRes => postFunction(project, apiRes)),
            )
            .subscribe(
              ...postSubscribe
            )
        );
      } else {
        this.subscriptions.add(
          this.projectService.add(project)
            .pipe(
          )
            .subscribe(
              ...postSubscribe
            )
        );
      }

    } else {
      // PUT
      // need to add on legislation year so that we can know where to put it on the root object
      const project = (new Project({
        ...this.convertFormToProject(this.myForm),
        legislationYear: this.legislationYear,
        _id: this.projectId
      }));

      if (putFunction) {
        this.subscriptions.add(
          this.projectService.save(project)
            .pipe(
              switchMap(() => putFunction(project)),
            )
            .subscribe(
              ...putSubscribe
            ));
      } else {
        this.subscriptions.add(
          this.projectService.save(project)
            .pipe(
          )
            .subscribe(
              ...putSubscribe
            )
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
        null,
        () => {
          this.clearStorageService();
          this.loading = false;
          this.openSnackBar('This project was created successfuly.', 'Close');
          this.router.navigate(['/p', this.projectId, 'project-details']);
        }
      ],
      // PUT SUBSCRIBE
      [
        null,
        null,
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

  getLists() {
    // List values only have 2002 and 2018 values.
    // If a project is set to 1996 legislation, make sure
    // to load the 2002 codes.

    this.configService.lists.forEach(item => {
      const tempLegislationYear = this.legislationYear === 1996 ? 2002 : this.legislationYear;
      switch (`${item.type}|${item.legislation}`) {
        case `eaDecisions|${tempLegislationYear}`:
          this.eacDecisions.push({ ...item });
          break;
        case `ceaaInvolvements|${tempLegislationYear}`:
          this.ceaaInvolvements.push({ ...item });
          break;
        case `projectPhase|${tempLegislationYear}`:
          this.projectPhases.push({ ...item });
          break;
        default:
          break;
      }
    });

    // Sorts by legislation first and then listOrder for each legislation group.
    this.eacDecisions = this.eacDecisions.slice().sort((a, b) => {
      if (a.legislation !== b.legislation) {
        return (a.legislation || 0) - (b.legislation || 0);
      }
      return (a.listOrder || 0) - (b.listOrder || 0);
    });
    this.ceaaInvolvements = this.ceaaInvolvements.slice().sort((a, b) => {
      if (a.legislation !== b.legislation) {
        return (a.legislation || 0) - (b.legislation || 0);
      }
      return (a.listOrder || 0) - (b.listOrder || 0);
    });
    this.projectPhases = this.projectPhases.slice().sort((a, b) => {
      if (a.legislation !== b.legislation) {
        return (a.legislation || 0) - (b.legislation || 0);
      }
      return (a.listOrder || 0) - (b.listOrder || 0);
    });
  }

  ngOnDestroy() {
    // save state before destructing, helps with switching tabs
    // Only set the state if the form has info in it.
    if (this.myForm && this.myForm.value.name) {
      this.storageService.state.form2018 = this.myForm;
    } else {
      this.storageService.state.form2018 = null;
    }
    this.subscriptions.unsubscribe();
  }
}
