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

  const flushProject = (body: object, projId = EAGLE_ID) => http.expectOne(`/demi/projects/${projId}`).flush(body);
  const orgRequest = () => http.expectOne(r => r.url === '/demi/organizations');
  const projectOf = (result: any) => result[0].data.searchResults[0];

  it('reads every legislation block of the project from DEMI', async () => {
    const result = resolve();

    flushProject(demiRow({ proponentId: null, legislationYearList: [2018, 2002], legislation_2002: { name: 'Old' }, legislation_2018: { name: 'New' } }));

    const project = projectOf(await result);
    expect(project.currentLegislationYear).toBe('legislation_2018');
    expect(project.legislationYearList).toEqual([2002, 2018]);
    expect(project.legislation_2002.name).toBe('Old');
    expect(project.isPublished).toBeTrue();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('keeps the DEMI row as read, for the edit form\'s save to compare against', async () => {
    const row = demiRow({ proponentId: null });
    const result = resolve();

    flushProject(row);
    orgRequest().flush([]);

    expect(projectOf(await result).demiRow).toEqual(row);
  });

  it('swaps every proponent id for its organization, in one read', async () => {
    const result = resolve();

    flushProject(demiRow({ legislation_2018: { name: 'Copper Mine', proponent: 'stale-org' } }));
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

  it('keeps the proponent id and name on the current block when DEMI has no such organization', async () => {
    const result = resolve();

    flushProject(demiRow({ legislation_2002: { name: 'Old' } }));
    orgRequest().flush([]);

    const project = projectOf(await result);
    expect(project.proponent).toBeUndefined();
    expect(project.legislation_2018.proponent).toEqual({ _id: ORG_A, name: 'Copper Co.' });
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

  it('a Track-only row (id \'207\', no eagleId, no blocks, no legislationYear) sends one GET and resolves legislation_2018 from the top level, with no toast', async () => {
    const result = resolve('207');

    flushProject({ id: '207', name: 'Copper Mine' }, '207');

    const project = projectOf(await result);
    expect(project.currentLegislationYear).toBe('legislation_2018');
    expect(project.legislationYearList).toEqual([2018]);
    expect(project.legislation_2018.name).toBe('Copper Mine');
    expect(project.legislation_2018.centroid).toBeUndefined();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('a row with no Act whose only named block is legislation_2002 resolves that block as current', async () => {
    const result = resolve();

    flushProject(demiRow({
      proponentId: null,
      currentLegislationYear: undefined,
      legislationYearList: [2002],
      legislation_2002: { name: 'Old Copper Mine' },
      legislation_2018: {}
    }));

    const project = projectOf(await result);
    expect(project.currentLegislationYear).toBe('legislation_2002');
    expect(project.legislationYearList).toEqual([2002]);
  });

  it('a DEMI-created row with a UUID id and legislationYear 2018 resolves that block and isPublished', async () => {
    const uuid = '2e9c6a4e-1b8d-4c51-9a3f-0d6c1f2b7e11';
    const result = resolve(uuid);

    flushProject({ id: uuid, name: 'New Mine', legislationYear: 2018, isPublished: true, centroid: { type: 'Point', coordinates: [] } }, uuid);

    const project = projectOf(await result);
    expect(project.currentLegislationYear).toBe('legislation_2018');
    expect(project.legislation_2018.name).toBe('New Mine');
    expect(project.legislation_2018.centroid).toBeUndefined();
    expect(project.isPublished).toBeTrue();
  });

  it('the current block is the top level renamed: projectType as type, address as location, abbreviation as shortName, isActive as activeStatus, centroid as [lon, lat]', async () => {
    const result = resolve();

    flushProject(demiRow({
      proponentId: null,
      legislation_2002: { name: 'Old' },
      projectType: 'Mines',
      address: 'Near Smithers',
      abbreviation: 'CM',
      isActive: 'active',
      centroid: { type: 'Point', coordinates: [-127.2, 54.8] }
    }));

    const block = projectOf(await result).legislation_2018;
    expect(block.type).toBe('Mines');
    expect(block.location).toBe('Near Smithers');
    expect(block.shortName).toBe('CM');
    expect(block.activeStatus).toBe('active');
    expect(block.centroid).toEqual([-127.2, 54.8]);
  });

  it('a field cleared at the top level shows empty even when the stored block still holds it', async () => {
    const result = resolve();

    flushProject(demiRow({
      proponentId: null,
      currentLegislationYear: 'legislation_1996',
      legislationYearList: ['1996'],
      legislation_1996: { name: 'Stale Name', currentPhaseCode: 'decision' },
      legislation_2002: undefined,
      legislation_2018: undefined
    }));

    const project = projectOf(await result);
    expect(project.currentLegislationYear).toBe('legislation_1996');
    expect(project.legislationYearList).toEqual([1996]);
    expect(project.legislation_1996.name).toBe('Copper Mine');
    expect(project.legislation_1996.currentPhaseCode).toBeUndefined();
  });
});
