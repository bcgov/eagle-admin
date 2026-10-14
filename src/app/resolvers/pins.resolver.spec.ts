import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';

import { pinsResolver } from './pins.resolver';
import { ProjectService } from '../services/project.service';
import { DemiProject } from '../models/demi/project';

describe('pinsResolver', () => {
  it('reads the DEMI project row for the parent route project id', async () => {
    const row: DemiProject = { id: 'demi-7', eagleId: 'eagle-1', name: 'Mine', pins: [{ _id: 'o1', name: 'Tsawout' }] };
    const projectService = jasmine.createSpyObj<ProjectService>('ProjectService', ['getNative']);
    projectService.getNative.and.returnValue(of(row));
    TestBed.configureTestingModule({ providers: [{ provide: ProjectService, useValue: projectService }] });
    const route = { parent: { paramMap: convertToParamMap({ projId: 'eagle-1' }) } } as unknown as ActivatedRouteSnapshot;

    const result = await firstValueFrom(TestBed.runInInjectionContext(() => pinsResolver(route, null)) as Observable<DemiProject>);

    expect(projectService.getNative).toHaveBeenCalledWith('eagle-1');
    expect(result.pins[0].name).toBe('Tsawout');
  });
});
