import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';

import { projectResolver } from './project.resolver';
import { ProjectService } from '../services/project.service';
import { StorageService } from '../services/storage.service';
import { LegacyProject } from '../models/demi/project-legacy';

describe('projectResolver', () => {
  let projectService: jasmine.SpyObj<ProjectService>;
  let storage: { state: Record<string, any> };

  beforeEach(() => {
    projectService = jasmine.createSpyObj<ProjectService>('ProjectService', ['getNative']);
    storage = { state: {} };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: projectService },
        { provide: StorageService, useValue: storage }
      ]
    });
  });

  function resolve(projId: string): Promise<LegacyProject | RedirectCommand> {
    const route = { paramMap: convertToParamMap({ projId }) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => projectResolver(route, null));
    return firstValueFrom(result as Observable<LegacyProject | RedirectCommand>);
  }

  it('returns the legacy project keyed on the Eagle id', async () => {
    projectService.getNative.and.returnValue(of({ id: '7', eagleId: 'e1', name: 'Mine', projectType: 'Mines' }));

    const project = await resolve('e1') as LegacyProject;

    expect(projectService.getNative).toHaveBeenCalledWith('e1');
    expect(project._id).toBe('e1');
    expect(project.demiId).toBe('7');
    expect(project.type).toBe('Mines');
    expect(storage.state['currentProject'].data).toBe(project);
  });

  it('redirects to search when the project cannot be read', async () => {
    projectService.getNative.and.returnValue(throwError(() => new Error('Project not found')));

    expect(await resolve('missing')).toEqual(jasmine.any(RedirectCommand));
  });
});
