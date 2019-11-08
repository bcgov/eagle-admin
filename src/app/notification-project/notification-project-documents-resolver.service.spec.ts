import { TestBed } from '@angular/core/testing';

import { NotificationProjectDocumentsResolver } from './notification-project-documents-resolver.service';

describe('NotificationProjectResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotificationProjectDocumentsResolver = TestBed.get(NotificationProjectDocumentsResolver);
    expect(service).toBeTruthy();
  });
});
