import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from './api';
import { LoggingService } from './logging.service';
import { ProjectService } from './project.service';
import { SearchService } from './search.service';
import { ToastService } from './toast.service';

describe('ProjectService.getById', () => {
  let service: ProjectService;
  let api: jasmine.SpyObj<ApiService>;
  let search: jasmine.SpyObj<SearchService>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'buildValues']);
    api.buildValues.and.returnValue('');
    search = jasmine.createSpyObj<SearchService>('SearchService', ['getItem']);
    search.getItem.and.callFake((id: string) => of({ data: { _id: id } }));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
        { provide: SearchService, useValue: search },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) }
      ]
    });
    service = TestBed.inject(ProjectService);
  });

  it('loads a project whose EPD is null and fetches only the lead', async () => {
    api.get.and.returnValue(of([{ _id: 'p1', projectLeadId: 'u1', responsibleEPDId: null }]));

    const project = await firstValueFrom(service.getById('p1'));

    expect(project._id).toBe('p1');
    expect(search.getItem.calls.allArgs()).toEqual([['u1', 'User']]);
    expect(project.projectLeadObj).toEqual(jasmine.objectContaining({ _id: 'u1' }));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('loads a project whose lead is null and fetches only the EPD', async () => {
    api.get.and.returnValue(of([{ _id: 'p1', projectLeadId: null, responsibleEPDId: 'u2' }]));

    const project = await firstValueFrom(service.getById('p1'));

    expect(project._id).toBe('p1');
    expect(search.getItem.calls.allArgs()).toEqual([['u2', 'User']]);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
