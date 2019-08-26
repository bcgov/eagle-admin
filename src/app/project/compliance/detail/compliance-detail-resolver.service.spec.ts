import { TestBed } from '@angular/core/testing';

import { ComplianceDetailResolver } from './compliance-detail-resolver.service';

describe('ComplianceDetailResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComplianceDetailResolver = TestBed.get(ComplianceDetailResolver);
    expect(service).toBeTruthy();
  });
});
