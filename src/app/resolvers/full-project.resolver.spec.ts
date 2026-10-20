import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { convertToParamMap, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { fullProjectResolver } from './full-project.resolver';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';

const EAGLE_ID = '5885109faaecd9001b81314c';
const ORG_A = '58850f69aaecd9001b8085cd';
const ORG_B = '5df79dd77b5abbf7da6f51e7';

const demiRow = (fields: object = {}) => ({
  id: '207',
  eagleId: EAGLE_ID,
  name: 'Copper Mine',
  isPublished: true,
  proponentId: ORG_A,
  proponentName: 'Copper Co.',
  currentLegislationYear: 'legislation_2018',
  legislationYearList: [2002, 2018],
  legislation_2002: { name: 'Old Copper Mine', proponent: ORG_B },
  legislation_2018: { name: 'Copper Mine', proponent: ORG_A },
  ...fields
});

describe('fullProjectResolver', () => {
  let http: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;
  let logger: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['error']);
    logger = jasmine.createSpyObj('LoggingService', ['error']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: () => ({}), getApiPath: () => '/api', getDemiApiPath: () => '/demi' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: logger },
        { provide: ToastService, useValue: toast }
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

  const flushProject = (body: object) => http.expectOne(`/demi/projects/${EAGLE_ID}`).flush(body);
  const orgRequest = () => http.expectOne(r => r.url === '/demi/organizations');
  const projectOf = (result: any) => result[0].data.searchResults[0];

  it('reads the project from DEMI and keys it by its Eagle id', async () => {
    const result = resolve();

    flushProject(demiRow({ proponentId: null, legislation_2002: { name: 'Old' }, legislation_2018: { name: 'New' } }));

    const project = projectOf(await result);
    expect(project._id).toBe(EAGLE_ID);
    expect(project.currentLegislationYear).toBe('legislation_2018');
    expect(project.legislationYearList).toEqual([2002, 2018]);
    expect(project.legislation_2002.name).toBe('Old');
    expect(project.isPublished).toBeTrue();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('swaps every proponent id for its organization, in one read', async () => {
    const result = resolve();

    flushProject(demiRow());
    const req = orgRequest();
    expect(req.request.params.get('ids')).toBe(`${ORG_A},${ORG_B}`);
    req.flush([{ id: ORG_A, name: 'Copper Co.' }, { id: ORG_B, name: 'Old Copper Co.' }]);

    const project = projectOf(await result);
    expect(project.proponent).toEqual(jasmine.objectContaining({ _id: ORG_A, name: 'Copper Co.' }));
    expect(project.proponentId).toBe(ORG_A);
    expect(project.proponentName).toBe('Copper Co.');
    expect(project.legislation_2018.proponent).toEqual(jasmine.objectContaining({ _id: ORG_A, name: 'Copper Co.' }));
    expect(project.legislation_2002.proponent).toEqual(jasmine.objectContaining({ _id: ORG_B, name: 'Old Copper Co.' }));
  });

  it('leaves off a proponent DEMI does not have, keeping the id fields', async () => {
    const result = resolve();

    flushProject(demiRow({ legislation_2002: { name: 'Old' } }));
    orgRequest().flush([]);

    const project = projectOf(await result);
    expect(project.proponent).toBeUndefined();
    expect('proponent' in project.legislation_2018).toBeFalse();
    expect(project.proponentId).toBe(ORG_A);
    expect(project.proponentName).toBe('Copper Co.');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('yields no results and shows an error when DEMI has no such project', async () => {
    const result = resolve();

    http.expectOne(`/demi/projects/${EAGLE_ID}`).flush({ error: 'Project not found' }, { status: 404, statusText: 'Not Found' });

    expect((await result)[0].data.searchResults).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Failed to load project.');
  });

  it('yields no results and shows an error when the row has no legislation blocks yet', async () => {
    const result = resolve();

    flushProject({ id: '207', eagleId: EAGLE_ID, name: 'Copper Mine', proponentId: ORG_A });

    http.expectNone(r => r.url === '/demi/organizations');
    expect((await result)[0].data.searchResults).toEqual([]);
    expect(logger.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('skips DEMI for a Track-only project reached by DEMI id', async () => {
    const result = await resolve('2e9c6a4e-1b8d-4c51-9a3f-0d6c1f2b7e11');

    http.expectNone(() => true);
    expect(result[0].data.searchResults).toEqual([]);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
