import { TestBed } from '@angular/core/testing';

import { SubmissionDetailResolver } from './submission-detail-resolver.service';

describe('SubmissionDetailResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SubmissionDetailResolver = TestBed.get(SubmissionDetailResolver);
    expect(service).toBeTruthy();
  });
});
