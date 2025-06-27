import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Org } from 'src/app/models/org';
import { OrgService } from 'src/app/services/org.service';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
  templateUrl: './add-edit-organization.component.html',
  styleUrls: ['./add-edit-organization.component.scss']
})

export class AddEditOrganizationComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  public isEditing = false;
  public loading = false;
  public navigationObject;
  public orgForm: UntypedFormGroup;
  public orgId = '';
  public parentOrganizationName = '';
  public parentOrgId = '';

  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    height: 240
  };

  public companyTypeList = [
    'Indigenous Group',
    'Proponent/Certificate Holder',
    'Other Agency',
    'Local Government',
    'Municipality',
    'Ministry',
    'Consultant',
    'Other Government',
    'Community Group',
    'Other'
  ];
  public provinceList = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private orgService: OrgService,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    }

    this.subscriptions.add(
      this.route.data
        .subscribe(res => {
          this.isEditing = Object.keys(res).length === 0 && res.constructor === Object ? false : true;
          this.orgId = this.isEditing ? res.organization._id : '';

          if (this.storageService.state.selectedOrganization) {
            this.parentOrganizationName = this.storageService.state.selectedOrganization.name;
            this.parentOrgId = this.storageService.state.selectedOrganization._id;
          } else if (this.isEditing && res.organization.parentCompany && res.organization.parentCompany !== '') {
            this.parentOrganizationName = res.organization.parentCompany.data.name;
            this.parentOrgId = res.organization.parentCompany.data._id;
          }

          if (this.storageService.state.orgForm == null) {
            if (!this.isEditing) {
              this.buildForm({
                description: '',
                name: '',
                country: '',
                postal: '',
                province: '',
                city: '',
                address1: '',
                address2: '',
                companyType: '',
                parentCompany: this.parentOrgId,
                companyLegal: '',
                company: ''
              });
            } else {
              this.buildForm(res.organization);
            }
          } else {
            this.orgForm = this.storageService.state.orgForm;
            this.orgForm.controls.parentCompany.setValue(this.parentOrgId);
          }
          this.loading = false;
        })
    );
  }

  private buildForm(data) {
    this.orgForm = new UntypedFormGroup({
      description: new UntypedFormControl(data.description),
      name: new UntypedFormControl(data.name),
      country: new UntypedFormControl(data.country),
      postal: new UntypedFormControl(data.postal),
      province: new UntypedFormControl(data.province),
      city: new UntypedFormControl(data.city),
      address1: new UntypedFormControl(data.address1),
      address2: new UntypedFormControl(data.address2),
      companyType: new UntypedFormControl(data.companyType),
      parentCompany: new UntypedFormControl(this.parentOrgId),
      companyLegal: new UntypedFormControl(data.companyLegal),
      company: new UntypedFormControl(data.company)
    });
  }

  private clearStorageService() {
    this.storageService.state.orgForm = null;
    this.storageService.state.selectedOrganization = null;
  }

  private setBreadCrumbs() {
    if (!this.isEditing) {
      if (this.navigationObject) {
        const nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
        nextBreadcrumbs.push(
          {
            route: ['/orgs', 'add'],
            label: 'Add Organization'
          }
        );
        this.navigationStackUtils.pushNavigationStack(
          ['/orgs', 'add'],
          nextBreadcrumbs
        );
      } else {
        this.navigationStackUtils.pushNavigationStack(
          ['/orgs', 'add'],
          [
            {
              route: ['/orgs'],
              label: 'Organizations'
            },
            {
              route: ['/orgs', 'add'],
              label: 'Add'
            }
          ]
        );
      }
    } else {
      this.navigationStackUtils.pushNavigationStack(
        ['/o', this.orgId, 'edit'],
        [
          {
            route: ['/orgs'],
            label: 'Organizations'
          },
          {
            route: ['/o', this.orgId, 'edit'],
            label: 'Edit'
          }
        ]
      );
    }
  }

  private validateForm() {
    // TODO: cover all validation cases.
    if (this.orgForm.controls.name.value === '') {
      alert('Organization name cannot be empty.');
      return false;
    } else if (this.orgForm.controls.companyType.value === '') {
      alert('Organization type cannot be empty.');
      return false;
    } else if (this.orgForm.controls.address1.value === '') {
      alert('Street address type cannot be empty.');
      return false;
    } else if (this.orgForm.controls.city.value === '') {
      alert('City type cannot be empty.');
      return false;
    } else if (this.orgForm.controls.country.value === '') {
      alert('Country type cannot be empty.');
      return false;
    } else {
      return true;
    }
  }

  public onSubmit() {
    // Validating form
    if (!this.validateForm()) {
      return;
    }

    const org = new Org({
      description: this.orgForm.controls.description.value,
      name: this.orgForm.controls.name.value,
      country: this.orgForm.controls.country.value,
      postal: this.orgForm.controls.postal.value,
      province: this.orgForm.controls.province.value,
      city: this.orgForm.controls.city.value,
      address1: this.orgForm.controls.address1.value,
      address2: this.orgForm.controls.address2.value,
      companyType: this.orgForm.controls.companyType.value,
      parentCompany: this.orgForm.controls.parentCompany.value,
      companyLegal: this.orgForm.controls.companyLegal.value,
      company: this.orgForm.controls.company.value
    });

    this.clearStorageService();
    if (!this.isEditing) {
      this.orgService.add(org)
        .subscribe(() => {
          if (this.navigationStackUtils.getLastBackUrl()) {
            this.router.navigate(this.navigationStackUtils.popNavigationStack().backUrl);
          } else {
            this.router.navigate(['orgs']);
          }
        });
    } else {
      org._id = this.orgId;
      this.orgService.save(org)
        .subscribe(() => {
          this.router.navigate(['orgs']);
        });
    }
  }

  public onCancel() {
    this.clearStorageService();
    if (this.navigationStackUtils.getLastBackUrl()) {
      this.router.navigate(this.navigationStackUtils.popNavigationStack().backUrl);
    } else {
      this.router.navigate(['orgs']);
    }
  }

  public removeSelectedOrganization() {
    this.storageService.state.selectedOrganization = null;
    this.parentOrganizationName = '';
    this.orgForm.controls.parentCompany.setValue('');
  }

  public linkOrganization() {
    this.setBreadCrumbs();
    this.storageService.state.orgForm = this.orgForm;
    if (!this.isEditing) {
      this.router.navigate(['orgs', 'add', 'link-org']);
    } else {
      this.router.navigate(['o', this.orgId, 'edit', 'link-org']);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
