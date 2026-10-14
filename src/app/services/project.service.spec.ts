import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ProjectService, READ_ONLY_PROJECT } from './project.service';
import { ToastService } from './toast.service';
import { Project } from '../models/project';
import { DemiProject } from '../models/demi/project';
import { toLegacyProject } from '../models/demi/project-legacy';

const EAGLE_ID = '5885109faaecd9001b81314c';

function nativeRow(overrides: Partial<DemiProject> = {}): DemiProject {
  return { id: '7', eagleId: EAGLE_ID, name: 'Ashcroft Ranch Landfill', ...overrides };
}

describe('ProjectService', () => {
  let service: ProjectService;
  let http: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['error']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    });
    service = TestBed.inject(ProjectService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('native reads', () => {
    it('lists projects by page with a total, sorted by name', async () => {
      const page = firstValueFrom(service.list({ page: 3, pageSize: 20 }));

      const req = http.expectOne(r => r.url === '/demi/api/projects');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('pageSize')).toBe('20');
      expect(req.request.params.get('count')).toBe('true');
      expect(req.request.params.get('sort')).toBe('name');
      req.flush([nativeRow()], { headers: { 'x-total-count': '371' } });

      expect((await page).total).toBe(371);
    });

    it('reads one project by id', () => {
      service.getNative(EAGLE_ID).subscribe();

      http.expectOne(`/demi/api/projects/${EAGLE_ID}`).flush(nativeRow());
    });

    it('looks users up by ids', () => {
      service.getUsers(['u1', 'u2']).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/users');
      expect(req.request.params.get('ids')).toBe('u1,u2');
      req.flush([]);
    });

    it('reads one group by id', () => {
      service.getGroup('g1').subscribe();

      http.expectOne('/demi/api/groups/g1').flush({ id: 'g1' });
    });

    it('lists comment periods by the DEMI project id', () => {
      service.getCommentPeriods('7', { sort: '-dateStarted' }).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/comment-periods');
      expect(req.request.params.get('project')).toBe('7');
      expect(req.request.params.get('count')).toBe('true');
      expect(req.request.params.get('sort')).toBe('-dateStarted');
      req.flush([]);
    });
  });

  describe('eagle-api reads', () => {
    it('getForEdit reads the project from eagle-api by Eagle id', async () => {
      const project = firstValueFrom(service.getForEdit(EAGLE_ID));

      http.expectOne(r => r.url.startsWith(`/api/project/${EAGLE_ID}?`)).flush([{ _id: EAGLE_ID, name: 'Ashcroft' }]);

      expect((await project)._id).toBe(EAGLE_ID);
    });

    it('getById fills only the lead when the EPD is null, from DEMI users', async () => {
      const project = firstValueFrom(service.getById('p1'));

      http.expectOne(r => r.url.startsWith('/api/project/p1?'))
        .flush([{ _id: 'p1', projectLeadId: 'u1', responsibleEPDId: null }]);
      const users = http.expectOne(r => r.url === '/demi/api/users');
      expect(users.request.params.get('ids')).toBe('u1');
      users.flush([{ id: 'u1', displayName: 'Lead Person' }]);

      const result = await project;
      expect(result.projectLeadObj.displayName).toBe('Lead Person');
      expect(result.projectLeadObj._id).toBe('u1');
      expect(result.responsibleEPDObj).toBeUndefined();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('getPeopleObjs gives the edit form contacts keyed on the Eagle user _id', async () => {
      const legislation2002 = { name: 'Mine', responsibleEPDId: 'u2', projectLeadId: 'u1' } as any;
      const data = [{ data: { searchResults: [{ legislationYearList: [2002], legislation_2002: legislation2002 }] } }];
      const done = firstValueFrom(service.getPeopleObjs(data));

      http.expectOne(r => r.url === '/demi/api/users')
        .flush([{ id: 'u1', eagleId: 'u1', displayName: 'Lead' }, { id: 'u2', eagleId: 'u2', displayName: 'EPD' }]);
      await done;

      expect(legislation2002.responsibleEPDObj._id).toBe('u2');
      expect(legislation2002.projectLeadObj._id).toBe('u1');
    });

    it('getById fills the EPD when the lead is null', async () => {
      const project = firstValueFrom(service.getById('p1'));

      http.expectOne(r => r.url.startsWith('/api/project/p1?'))
        .flush([{ _id: 'p1', projectLeadId: null, responsibleEPDId: 'u2' }]);
      http.expectOne(r => r.url === '/demi/api/users').flush([{ id: 'u2', displayName: 'EPD Person' }]);

      expect((await project).responsibleEPDObj.displayName).toBe('EPD Person');
    });
  });

  describe('writes', () => {
    it('publishes a legacy project built from a DEMI row under its Eagle id', () => {
      service.publish(toLegacyProject(nativeRow())).subscribe();

      const req = http.expectOne(`/api/project/${EAGLE_ID}/publish`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('maps a native row to its Eagle id before adding pins', () => {
      service.addPins(nativeRow(), ['org1']).subscribe();

      const req = http.expectOne(`/api/project/${EAGLE_ID}/pin`);
      expect(req.request.body).toEqual(['org1']);
      req.flush({});
    });

    it('maps a native row to its Eagle id before adding a group', () => {
      service.addGroup(nativeRow(), 'Working Group').subscribe();

      const req = http.expectOne(`/api/project/${EAGLE_ID}/group`);
      expect(req.request.body).toEqual({ group: 'Working Group' });
      req.flush({});
    });

    it('sends a legacy project body unchanged', () => {
      const legacy = new Project({ _id: EAGLE_ID, name: 'Legacy name', type: 'Mines' });

      service.unPublish(legacy).subscribe();

      const req = http.expectOne(`/api/project/${EAGLE_ID}/unpublish`);
      expect(req.request.body.name).toBe('Legacy name');
      expect(req.request.body.type).toBe('Mines');
      req.flush({});
    });

    it('sends a native row body under Eagle field names', () => {
      service.publish(nativeRow({ projectType: 'Mines' })).subscribe();

      const req = http.expectOne(`/api/project/${EAGLE_ID}/publish`);
      expect(req.request.body._id).toBe(EAGLE_ID);
      expect(req.request.body.type).toBe('Mines');
      req.flush({});
    });

    it('refuses to write a project without an Eagle id', async () => {
      const write = firstValueFrom(service.publish(nativeRow({ eagleId: null })));

      await expectAsync(write).toBeRejectedWithError(READ_ONLY_PROJECT);
      http.expectNone(r => r.url.startsWith('/api/project'));
    });
  });
});
