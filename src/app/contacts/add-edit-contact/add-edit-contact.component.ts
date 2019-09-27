import { Component, OnInit, OnDestroy } from '@angular/core';

import { Topic } from 'app/models/topic';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { User } from 'app/models/user';
import { UserService } from 'app/services/user.service';
import { StorageService } from 'app/services/storage.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

export interface DataModel {
  title: string;
  message: string;
  model: Topic;
}

@Component({
  templateUrl: './add-edit-contact.component.html',
  styleUrls: ['./add-edit-contact.component.scss']
})

// NOTE: dialog components must not implement OnDestroy
//       otherwise they don't return a result
export class AddEditContactComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private navigationObject;

  public currentProject;
  public contactForm: FormGroup;
  public isEditing = false;
  public loading = false;
  public contactOrganizationName = '';
  public contactId = '';
  public contact = null;
  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    height: 240
  };
  public phonePattern;
  public salutationList = ['Mr.', 'Mrs.', 'Miss', 'Dr.', 'Ms', 'Chief', 'Mayor', 'Minister'];
  public provinceList = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService,
    private userService: UserService
  ) { }

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    }
    let org = '';
    if (this.storageService.state.selectedOrganization) {
      this.contactOrganizationName = this.storageService.state.selectedOrganization.name;
      org = this.storageService.state.selectedOrganization._id;
    }

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        this.isEditing = Object.keys(res).length === 0 && res.constructor === Object ? false : true;
        this.contactId = this.isEditing ? res.contact.data._id : '';

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
          } else {
            if (org !== '') {
              res.contact.data.org = org;
              res.contact.data.orgName = this.contactOrganizationName;
            } else {
              this.contactOrganizationName = res.contact.data.orgName;
            }
            this.buildForm(res.contact.data);
          }
        } else {
          this.contactForm = this.storageService.state.contactForm;
          this.contactForm.controls.org.setValue(org);
        }
        this.loading = false;
      });
  }

  private setBreadcrumbs() {
    if (!this.isEditing) {
      if (this.navigationObject) {
        // We're coming from a different component so we have to preserve our nav stack.
        console.log('nav object', this.navigationObject);
        let nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
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
      'firstName': new FormControl(data.firstName),
      'middleName': new FormControl(data.middleName),
      'lastName': new FormControl(data.lastName),
      'email': new FormControl(data.email),
      'org': new FormControl(data.org),
      'title': new FormControl(data.title),
      'phoneNumber': new FormControl(data.phoneNumber),
      'salutation': new FormControl(data.salutation),
      'department': new FormControl(data.department),
      'faxNumber': new FormControl(data.faxNumber),
      'cellPhoneNumber': new FormControl(data.cellPhoneNumber),
      'address1': new FormControl(data.address1),
      'address2': new FormControl(data.address2),
      'city': new FormControl(data.city),
      'province': new FormControl(data.province),
      'country': new FormControl(data.country),
      'postalCode': new FormControl(data.postalCode),
      'notes': new FormControl(data.notes),
    });
  }

  private clearStorageService() {
    this.storageService.state.contactForm = null;
    this.storageService.state.selectedOrganization = null;
  }

  public onSubmit() {
    // Validating form
    // TODO: cover all validation cases.
    if (this.contactForm.controls.firstName.value === '') {
      alert('First name cannot be empty.');
      return;
    } else if (this.contactForm.controls.lastName.value === '') {
      alert('Last name cannot be empty.');
      return;
    } else if (this.contactForm.controls.org.value === '') {
      alert('You must select an organization.');
      return;
    }

    let user = new User({
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
          console.log('item', item);
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
          console.log('item', item);
          this.router.navigate(['/contacts']);
        });
    }
  }

  public linkOrganization() {
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
    let backUrl = this.navigationStackUtils.getLastBackUrl();
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
