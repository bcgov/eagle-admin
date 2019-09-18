import { TestBed } from '@angular/core/testing';

import { InspectionDetailResolver } from './inspection-detail-resolver.service';

describe('InspectionDetailResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InspectionDetailResolver = TestBed.get(InspectionDetailResolver);
    expect(service).toBeTruthy();
  });
});
