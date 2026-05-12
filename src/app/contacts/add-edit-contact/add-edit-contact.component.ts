import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Topic } from 'src/app/models/topic';
import { User } from 'src/app/models/user';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';
import { SearchService } from 'src/app/services/search.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { EditorModule } from '@tinymce/tinymce-angular';
import { LoggingService } from 'src/app/services/logging.service';
import { finalize } from 'rxjs/operators';


export interface DataModel {
  title: string;
  message: string;
  model: Topic;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './add-edit-contact.component.html',
    styleUrl: './add-edit-contact.component.css',
    imports: [ReactiveFormsModule, EditorModule, RouterLink],
})

// NOTE: dialog components must not implement OnDestroy
//       otherwise they don't return a result
export class AddEditContactComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logger = inject(LoggingService);
  private navigationStackUtils = inject(NavigationStackUtils);
  private storageService = inject(StorageService);
  private userService = inject(UserService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private navigationObject;

  public currentProject;
  public contactForm: FormGroup<{
    firstName: FormControl<string | null>;
    middleName: FormControl<string | null>;
    lastName: FormControl<string | null>;
    email: FormControl<string | null>;
    org: FormControl<string | null>;
    title: FormControl<string | null>;
    phoneNumber: FormControl<string | null>;
    salutation: FormControl<string | null>;
    department: FormControl<string | null>;
    faxNumber: FormControl<string | null>;
    cellPhoneNumber: FormControl<string | null>;
    address1: FormControl<string | null>;
    address2: FormControl<string | null>;
    city: FormControl<string | null>;
    province: FormControl<string | null>;
    country: FormControl<string | null>;
    postalCode: FormControl<string | null>;
    notes: FormControl<string | null>;
  }>;
  public isEditing = false;
  public loading = false;
  public contactOrganizationName = '';
  public contactId = '';
  public contact = null;
  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    promotion: false,
    height: 240
  };
  public phonePattern;
  public salutationList = ['Mr.', 'Mrs.', 'Miss', 'Dr.', 'Ms', 'Chief', 'Mayor', 'Minister'];
  public provinceList = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    }
    let org = '';
    if (this.storageService.state.selectedOrganization) {
      this.contactOrganizationName = this.storageService.state.selectedOrganization.name;
      org = this.storageService.state.selectedOrganization._id;
    }

    const contactId = this.route.snapshot.paramMap.get('contactId');
    this.isEditing = !!contactId;
    this.contactId = contactId || '';

    if (this.storageService.state.contactForm == null) {
      if (!this.isEditing) {
        this.buildForm({
          'firstName': '',
          'middleName': '',
          'lastName': '',
          'displayName': '',
          'email': '',
          'org': org,
          'title': '',
          'phoneNumber': '',
          'salutation': '',
          'department': '',
          'faxNumber': '',
          'cellPhoneNumber': '',
          'address1': '',
          'address2': '',
          'city': '',
          'province': '',
          'country': '',
          'postalCode': '',
          'notes': ''
        });
        this.loading = false;
      } else {
        this.loading = true;
        this.searchService.getItem(contactId, 'User').pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => { this.loading = false; this.cdr.markForCheck(); })
        ).subscribe(res => {
          if (!res?.data) { return; }
          if (org !== '') {
            res.data.org = org;
            res.data.orgName = this.contactOrganizationName;
          } else {
            this.contactOrganizationName = res.data.orgName;
          }
          this.buildForm(res.data);
        });
      }
    } else {
      this.contactForm = this.storageService.state.contactForm;
      this.contactForm.controls.org.setValue(org);
      this.loading = false;
    }
  }

  private setBreadcrumbs() {
    if (!this.isEditing) {
      if (this.navigationObject) {
        // We're coming from a different component so we have to preserve our nav stack.
        this.logger.debug('nav object', 'AddEditContactComponent', this.navigationObject);
        const nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
        nextBreadcrumbs.push(
          {
            route: ['/contacts', 'add'],
            label: 'Add Contact'
          }
        );
        this.navigationStackUtils.pushNavigationStack(
          ['/contacts', 'add'],
          nextBreadcrumbs
        );
      } else {
        this.navigationStackUtils.pushNavigationStack(
          ['/contacts', 'add'],
          [
            {
              route: ['/contacts'],
              label: 'Contacts'
            },
            {
              route: ['/contacts', 'add'],
              label: 'Add'
            }
          ]
        );
      }
    } else {
      this.navigationStackUtils.pushNavigationStack(
        ['/c', this.contactId, 'edit'],
        [
          {
            route: ['/contacts'],
            label: 'Contacts'
          },
          {
            route: ['/c', this.contactId, 'edit'],
            label: 'Edit'
          }
        ]
      );
    }
  }

  private buildForm(data) {
    this.contactForm = new FormGroup({
      'firstName': new FormControl<string | null>(data.firstName, Validators.required),
      'middleName': new FormControl<string | null>(data.middleName),
      'lastName': new FormControl<string | null>(data.lastName, Validators.required),
      'email': new FormControl<string | null>(data.email),
      'org': new FormControl<string | null>(data.org, Validators.required),
      'title': new FormControl<string | null>(data.title),
      'phoneNumber': new FormControl<string | null>(data.phoneNumber),
      'salutation': new FormControl<string | null>(data.salutation),
      'department': new FormControl<string | null>(data.department),
      'faxNumber': new FormControl<string | null>(data.faxNumber),
      'cellPhoneNumber': new FormControl<string | null>(data.cellPhoneNumber),
      'address1': new FormControl<string | null>(data.address1),
      'address2': new FormControl<string | null>(data.address2),
      'city': new FormControl<string | null>(data.city),
      'province': new FormControl<string | null>(data.province),
      'country': new FormControl<string | null>(data.country),
      'postalCode': new FormControl<string | null>(data.postalCode),
      'notes': new FormControl<string | null>(data.notes),
    });
  }

  private clearStorageService() {
    this.storageService.state.contactForm = null;
    this.storageService.state.selectedOrganization = null;
  }

  public onSubmit() {
    // Validating form
    // TODO: cover all validation cases.
    if (!this.contactForm.controls.firstName.value) {
      alert('First name cannot be empty.');
      return;
    } else if (!this.contactForm.controls.lastName.value) {
      alert('Last name cannot be empty.');
      return;
    } else if (!this.contactForm.controls.org.value) {
      alert('You must select an organization.');
      return;
    }

    const user = new User({
      firstName: this.contactForm.controls.firstName.value,
      middleName: this.contactForm.controls.middleName.value,
      lastName: this.contactForm.controls.lastName.value,
      displayName: `${this.contactForm.controls.firstName.value} ${this.contactForm.controls.middleName.value} ${this.contactForm.controls.lastName.value}`,
      email: this.contactForm.controls.email.value,
      org: this.contactForm.controls.org.value,
      orgName: this.contactOrganizationName,
      title: this.contactForm.controls.title.value,
      phoneNumber: this.contactForm.controls.phoneNumber.value,
      salutation: this.contactForm.controls.salutation.value,
      department: this.contactForm.controls.department.value,
      faxNumber: this.contactForm.controls.faxNumber.value,
      cellPhoneNumber: this.contactForm.controls.cellPhoneNumber.value,
      address1: this.contactForm.controls.address1.value,
      address2: this.contactForm.controls.address2.value,
      city: this.contactForm.controls.city.value,
      province: this.contactForm.controls.province.value,
      country: this.contactForm.controls.country.value,
      postalCode: this.contactForm.controls.postalCode.value,
      notes: this.contactForm.controls.notes.value
    });

    this.clearStorageService();

    if (!this.isEditing) {
      this.userService.add(user)
        .subscribe(item => {
          this.logger.debug('contact added', 'AddEditContactComponent', item);
          if (this.navigationStackUtils.getLastBackUrl()) {
            this.router.navigate(this.navigationStackUtils.popNavigationStack().backUrl);
          } else {
            this.router.navigate(['/contacts']);
          }
        });
    } else {
      user._id = this.contactId;
      this.userService.save(user)
        .subscribe(item => {
          this.logger.debug('contact saved', 'AddEditContactComponent', item);
          this.router.navigate(['/contacts']);
        });
    }
  }

  public linkOrganization() {
    this.storageService.state.add = null;
    this.storageService.state.contactForm = this.contactForm;
    this.setBreadcrumbs();
    if (!this.isEditing) {
      this.router.navigate(['/contacts', 'add', 'link-org']);
    } else {
      this.router.navigate(['/c', this.contactId, 'edit', 'link-org']);
    }
  }

  public removeSelectedOrg() {
    this.storageService.state.selectedOrganization = null;
    this.contactOrganizationName = '';
    this.contactForm.controls.org.setValue('');
  }

  public onCancel() {
    this.clearStorageService();
    const backUrl = this.navigationStackUtils.getLastBackUrl();
    if (backUrl === null) {
      this.router.navigate(['/contacts']);
    } else {
      this.navigationStackUtils.popNavigationStack();
      this.router.navigate(backUrl);
    }
  }

  get phoneNumber() {
    return this.contactForm.get('phoneNumber');
  }
  get faxNumber() {
    return this.contactForm.get('faxNumber');
  }
  get cellPhoneNumber() {
    return this.contactForm.get('cellPhoneNumber');
  }
}
