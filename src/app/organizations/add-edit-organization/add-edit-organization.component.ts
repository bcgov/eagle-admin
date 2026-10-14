import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { of } from 'rxjs';
import { catchError, map, mergeMap, finalize } from 'rxjs/operators';
import { Organization } from 'src/app/models/demi/organization';
import { OrgService } from 'src/app/services/org.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-edit-organization.component.html',
  styleUrl: './add-edit-organization.component.css',
  imports: [ReactiveFormsModule, EditorModule, RouterLink]
})

export class AddEditOrganizationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected navigationStackUtils = inject(NavigationStackUtils);
  private orgService = inject(OrgService);
  private storageService = inject(StorageService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

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
    license_key: 'gpl',
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
        this.orgService.getOrganization(orgId).pipe(
            takeUntilDestroyed(this.destroyRef),
            mergeMap(org => {
              if (!org.parentCompany) { return of({ org, parent: null }); }
              // A parent DEMI cannot return must not block editing the child.
              return this.orgService.getOrganization(org.parentCompany).pipe(
                map(parent => ({ org, parent })),
                catchError(() => of({ org, parent: null }))
              );
            }),
            finalize(() => { this.loading = false; this.cdr.markForCheck(); })
          ).subscribe({
            next: ({ org, parent }) => {
              if (!this.storageService.state.selectedOrganization && org.parentCompany) {
                // Show the bare id when the parent is unreadable, so the kept link stays visible.
                this.parentOrganizationName = parent?.name ?? org.parentCompany;
                this.parentOrgId = org.parentCompany;
              }
              this.buildForm(org);
            },
            // ApiService.handleError has already logged it.
            error: () => this.toast.error('Failed to load organization.')
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

    // Form controls carry the native field names; OrgService maps the body to the eagle-api shape.
    const org: Partial<Organization> = {
      ...this.orgForm.getRawValue(),
      parentCompany: this.orgForm.controls.parentCompany.value || null
    };

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
      this.orgService.save({ ...org, id: this.orgId })
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
