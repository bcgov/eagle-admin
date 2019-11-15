import { TestBed } from '@angular/core/testing';

import { NotificationProjectResolver } from './notification-project-resolver.service';

describe('NotificationProjectResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotificationProjectResolver = TestBed.get(NotificationProjectResolver);
    expect(service).toBeTruthy();
  });
});
