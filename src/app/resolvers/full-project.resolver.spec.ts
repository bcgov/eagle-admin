import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { convertToParamMap, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';

import { fullProjectResolver } from './full-project.resolver';
import { ApiService } from '../services/api';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { LoggingService } from '../services/logging.service';
import { ProjectService } from '../services/project.service';
import { ToastService } from '../services/toast.service';

const EAGLE_ID = '5885109faaecd9001b81314c';

describe('fullProjectResolver', () => {
  let http: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['error']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: () => ({}), getApiPath: () => '/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: ProjectService, useValue: { getPeopleObjs: (data: unknown) => of(data) } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) },
        { provide: ToastService, useValue: toast },
        ApiService
      ]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function resolve(projId = EAGLE_ID): Promise<any> {
    const route = { pathFromRoot: [{ paramMap: convertToParamMap({ projId }) }] } as unknown as ActivatedRouteSnapshot;
    return firstValueFrom(TestBed.runInInjectionContext(
      () => fullProjectResolver(route, {} as RouterStateSnapshot) as Observable<any>
    ));
  }

  it('reads every legislation version of the project from eagle-api search', async () => {
    const result = resolve();

    const req = http.expectOne(r => r.url.startsWith('/api/search?'));
    expect(req.request.url).toBe(
      `/api/search?dataset=Project&pageNum=0&pageSize=1&projectLegislation=all&populate=true&and%5B_id%5D=${EAGLE_ID}`
    );
    req.flush([{ searchResults: [{ legislationYearList: [2018] }], meta: [] }]);

    expect((await result)[0].data.searchResults[0].legislationYearList).toEqual([2018]);
  });

  it('skips eagle-api for a Track-only project reached by DEMI id', async () => {
    const result = await resolve('2e9c6a4e-1b8d-4c51-9a3f-0d6c1f2b7e11');

    http.expectNone(r => r.url.startsWith('/api/search'));
    expect(result[0].data.searchResults).toEqual([]);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('yields no results and shows an error when the read fails', async () => {
    const result = resolve();

    http.expectOne(r => r.url.startsWith('/api/search?')).flush('boom', { status: 500, statusText: 'Server Error' });

    expect((await result)[0].data.searchResults).toEqual([]);
    expect(toast.error).toHaveBeenCalled();
  });
});
