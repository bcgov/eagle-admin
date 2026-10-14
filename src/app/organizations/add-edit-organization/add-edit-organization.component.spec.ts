import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { AddEditOrganizationComponent } from './add-edit-organization.component';
import { OrgService } from 'src/app/services/org.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { Organization } from 'src/app/models/demi/organization';

const CHILD = { id: 'child1', name: 'Child Co', companyType: 'Consultant', parentCompany: 'parent1' } as Organization;
const PARENT = { id: 'parent1', name: 'Parent Co' } as Organization;

describe('AddEditOrganizationComponent edit load', () => {
  let toast: jasmine.SpyObj<ToastService>;

  // Runs ngOnInit without rendering, so the TinyMCE editor never loads.
  function load(reads: Record<string, Observable<Organization>>): AddEditOrganizationComponent {
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);
    TestBed.configureTestingModule({
      imports: [AddEditOrganizationComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ orgId: 'child1' }) } } },
        { provide: OrgService, useValue: { getOrganization: (id: string) => reads[id] } },
        { provide: StorageService, useValue: { state: {} } },
        { provide: ToastService, useValue: toast },
        { provide: NavigationStackUtils, useValue: { getNavigationStack: () => null } }
      ]
    });
    const component = TestBed.createComponent(AddEditOrganizationComponent).componentInstance;
    component.ngOnInit();
    return component;
  }

  it('fills the form and the parent name from DEMI', () => {
    const component = load({ child1: of(CHILD), parent1: of(PARENT) });

    expect(component.orgForm.controls.name.value).toBe('Child Co');
    expect(component.parentOrganizationName).toBe('Parent Co');
    expect(component.orgForm.controls.parentCompany.value).toBe('parent1');
  });

  it('keeps the parent link and stays quiet when DEMI cannot return the parent', () => {
    const component = load({ child1: of(CHILD), parent1: throwError(() => new Error('Organization not found')) });

    expect(component.orgForm.controls.parentCompany.value).toBe('parent1');
    expect(component.parentOrganizationName).toBe('parent1');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error when the organization itself cannot be read', () => {
    load({ child1: throwError(() => new Error('Organization not found')) });

    expect(toast.error).toHaveBeenCalled();
  });
});
