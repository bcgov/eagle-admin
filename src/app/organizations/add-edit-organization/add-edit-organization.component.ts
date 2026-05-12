import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { of } from 'rxjs';
import { map, mergeMap, finalize } from 'rxjs/operators';
import { Org } from 'src/app/models/org';
import { OrgService } from 'src/app/services/org.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-edit-organization.component.html',
  styleUrl: './add-edit-organization.component.css',
  imports: [ReactiveFormsModule, EditorModule, RouterLink]
})

export class AddEditOrganizationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navigationStackUtils = inject(NavigationStackUtils);
  private orgService = inject(OrgService);
  private storageService = inject(StorageService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  public isEditing = false;
  public loading = false;
  public navigationObject;
  public orgForm: FormGroup<{
    description: FormControl<string | null>;
    name: FormControl<string | null>;
    country: FormControl<string | null>;
    postal: FormControl<string | null>;
    province: FormControl<string | null>;
    city: FormControl<string | null>;
    address1: FormControl<string | null>;
    address2: FormControl<string | null>;
    companyType: FormControl<string | null>;
    parentCompany: FormControl<string | null>;
    companyLegal: FormControl<string | null>;
    company: FormControl<string | null>;
  }>;
  public orgId = '';
  public parentOrganizationName = '';
  public parentOrgId = '';

  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    promotion: false,
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

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    }

    const orgId = this.route.snapshot.paramMap.get('orgId');
    this.isEditing = !!orgId;
    this.orgId = orgId || '';

    if (this.storageService.state.selectedOrganization) {
      this.parentOrganizationName = this.storageService.state.selectedOrganization.name;
      this.parentOrgId = this.storageService.state.selectedOrganization._id;
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
        this.loading = false;
      } else {
        this.loading = true;
        this.searchService.getItem(orgId, 'Organization').pipe(
            takeUntilDestroyed(this.destroyRef),
            map((res: any) => res.data),
            mergeMap((org: any) => {
              if (!org) { return of(null); }
              if (!org.parentCompany || org.parentCompany === '') { return of(org); }
              return this.searchService.getItem(org.parentCompany, 'Organization').pipe(
                map(parentCompany => {
                  org.parentCompany = parentCompany;
                  return org;
                })
              );
            }),
            finalize(() => { this.loading = false; this.cdr.markForCheck(); })
          ).subscribe({
            next: (org: any) => {
              if (org) {
                if (!this.storageService.state.selectedOrganization && org.parentCompany && org.parentCompany !== '') {
                  this.parentOrganizationName = org.parentCompany.data.name;
                  this.parentOrgId = org.parentCompany.data._id;
                }
                this.buildForm(org);
              } else {
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
              }
            }
          });
      }
    } else {
      this.orgForm = this.storageService.state.orgForm;
      this.orgForm.controls.parentCompany.setValue(this.parentOrgId);
      this.loading = false;
    }
  }

  private buildForm(data) {
    this.orgForm = new FormGroup({
      description: new FormControl<string | null>(data.description),
      name: new FormControl<string | null>(data.name),
      country: new FormControl<string | null>(data.country),
      postal: new FormControl<string | null>(data.postal),
      province: new FormControl<string | null>(data.province),
      city: new FormControl<string | null>(data.city),
      address1: new FormControl<string | null>(data.address1),
      address2: new FormControl<string | null>(data.address2),
      companyType: new FormControl<string | null>(data.companyType),
      parentCompany: new FormControl<string | null>(this.parentOrgId),
      companyLegal: new FormControl<string | null>(data.companyLegal),
      company: new FormControl<string | null>(data.company)
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
      parentCompany: this.orgForm.controls.parentCompany.value || null,
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
    this.orgForm.controls.parentCompany.setValue(null);
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

}
