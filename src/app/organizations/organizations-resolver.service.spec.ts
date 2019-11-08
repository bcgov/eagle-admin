import { TestBed } from '@angular/core/testing';

import { OrganizationsResolver } from './organizations-resolver.service';

describe('OrganizationsResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrganizationsResolver = TestBed.get(OrganizationsResolver);
    expect(service).toBeTruthy();
  });
});
