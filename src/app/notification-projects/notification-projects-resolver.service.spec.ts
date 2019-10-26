import { TestBed } from '@angular/core/testing';

import { NotificationProjectsResolver } from './notification-projects-resolver.service';

describe('NotificationProjectsResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotificationProjectsResolver = TestBed.get(NotificationProjectsResolver);
    expect(service).toBeTruthy();
  });
});
