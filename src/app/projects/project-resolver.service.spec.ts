import { TestBed, inject } from '@angular/core/testing';

import { ProjectDetailResolver } from './project-resolver.service';
import { ProjectService } from 'app/services/project.service';

describe('ProjectDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectDetailResolver,
        { provide: ProjectService }
      ]
    });
  });

  it('should be created', inject([ProjectDetailResolver], (service: ProjectDetailResolver) => {
    expect(service).toBeTruthy();
  }));
});
