import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { StorageService } from 'app/services/storage.service';

import { Org } from 'app/models/org';
import { OrgService } from 'app/services/org.service';

@Component({
  templateUrl: './add-edit-organization.component.html',
  styleUrls: ['./add-edit-organization.component.scss']
})

export class AddEditOrganizationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public orgForm: FormGroup;
  public isEditing = false;
  public loading = false;
  public parentOrganizationName = '';
  public parentOrgId = '';
  public orgId = '';

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
    private orgService: OrgService,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.route.data
      .takeUntil(this.ngUnsubscribe)
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

        this.setBreadCrumbs();

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
      });
  }

  private buildForm(data) {
    this.orgForm = new FormGroup({
      description: new FormControl(data.description),
      name: new FormControl(data.name),
      country: new FormControl(data.country),
      postal: new FormControl(data.postal),
      province: new FormControl(data.province),
      city: new FormControl(data.city),
      address1: new FormControl(data.address1),
      address2: new FormControl(data.address2),
      companyType: new FormControl(data.companyType),
      parentCompany: new FormControl(this.parentOrgId),
      companyLegal: new FormControl(data.companyLegal),
      company: new FormControl(data.company)
    });
  }

  private clearStorageService() {
    this.storageService.state.orgForm = null;
    this.storageService.state.selectedOrganization = null;
    this.storageService.state.backUrl = null;
    this.storageService.state.breadcrumbs = null;
  }

  private setBreadCrumbs() {
    if (!this.isEditing) {
      this.storageService.state.backUrl = ['/orgs', 'add'];
      this.storageService.state.breadcrumbs = [
        {
          route: ['/orgs'],
          label: 'Organizations'
        },
        {
          route: ['/orgs', 'add'],
          label: 'Add'
        }
      ];
    } else {
      this.storageService.state.backUrl = ['/o', this.orgId, 'edit'];
      this.storageService.state.breadcrumbs = [
        {
          route: ['/orgs'],
          label: 'Organizations'
        },
        {
          route: ['/o', this.orgId, 'edit'],
          label: 'Edit'
        }
      ];
    }
  }

  public onSubmit() {
    // Validating form
    // TODO: cover all validation cases.
    if (this.orgForm.controls.name.value === '') {
      alert('Name cannot be empty.');
      return;
    } else if (this.orgForm.controls.companyType.value === '') {
      alert('Organization type cannot be empty.');
      return;
    } else if (this.orgForm.controls.address1.value === '') {
      alert('Street address type cannot be empty.');
      return;
    } else if (this.orgForm.controls.city.value === '') {
      alert('City type cannot be empty.');
      return;
    } else if (this.orgForm.controls.country.value === '') {
      alert('Country type cannot be empty.');
      return;
    }

    let org = new Org({
      description: this.orgForm.controls.description.value,
      name: this.orgForm.controls.name.value,
      country: this.orgForm.controls.country.value,
      postal: this.orgForm.controls.postal.value,
      province: this.orgForm.controls.province.value,
      city: this.orgForm.controls.city.value,
      address1: this.orgForm.controls.address1.value,
      address2: this.orgForm.controls.address2.value,
      companyType: this.orgForm.controls.companyType.value ? this.orgForm.controls.companyType.value : this.orgForm.controls.name.value,
      parentCompany: this.orgForm.controls.parentCompany.value,
      companyLegal: this.orgForm.controls.companyLegal.value,
      company: this.orgForm.controls.company.value
    });

    this.clearStorageService();
    if (!this.isEditing) {
      this.orgService.add(org)
        .subscribe(item => {
          console.log('item', item);
          this.router.navigate(['orgs']);
        });
    } else {
      org._id = this.orgId;
      this.orgService.save(org)
        .subscribe(item => {
          console.log('item', item);
          this.router.navigate(['orgs']);
        });
    }
  }

  public onCancel() {
    this.clearStorageService();
    this.router.navigate(['orgs']);
  }

  public removeSelectedOrganization() {
    this.storageService.state.selectedOrganization = null;
    this.parentOrganizationName = '';
    this.orgForm.controls.parentCompany.setValue('');
  }

  public linkOrganization() {
    this.storageService.state.orgForm = this.orgForm;
    if (!this.isEditing) {
      this.router.navigate(['orgs', 'add', 'link-project']);
    } else {
      this.router.navigate(['o', this.orgId, 'edit', 'link-project']);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
