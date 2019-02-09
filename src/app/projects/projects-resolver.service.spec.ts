import { TestBed, inject } from '@angular/core/testing';

import { ProjectsResolver } from './projects-resolver.service';
import { ProjectService } from 'app/services/project.service';

describe('ProjectDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectsResolver,
        { provide: ProjectService }
      ]
    });
  });

  it('should be created', inject([ProjectsResolver], (service: ProjectsResolver) => {
    expect(service).toBeTruthy();
  }));
});
