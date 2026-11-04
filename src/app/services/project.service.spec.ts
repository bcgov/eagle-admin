import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from './config.service';
import { HttpCacheService, httpCacheInterceptor } from '../interceptors/http-cache.interceptor';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ProjectService, READ_ONLY_PROJECT } from './project.service';
import { ToastService } from './toast.service';
import { Project } from '../models/project';
import { DemiProject } from '../models/demi/project';
import { List } from '../models/demi/list';

const EAGLE_ID = '5885109faaecd9001b81314c';
const LISTS: List[] = [{ id: 'phase1', name: 'Pre-Application', type: 'projectPhase', legislation: 2018, listOrder: 1 }];

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
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api', lists: LISTS } },
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

  describe('contacts', () => {
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

  });

  describe('pin writes', () => {
    const pinned = () => nativeRow({ pins: [{ _id: 'o1', name: 'Tsawout' }, { _id: 'o2', name: 'Musqueam' }] });

    function answerRead() {
      http.expectOne(`/demi/api/projects/${EAGLE_ID}`).flush(pinned());
    }

    it('adds pins by sending the current list plus the new ids to the DEMI id', () => {
      service.addPins(EAGLE_ID, ['o3']).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ pins: ['o1', 'o2', 'o3'] });
      req.flush(pinned());
    });

    it('removes a pin by sending the current list without it', () => {
      service.deletePin(EAGLE_ID, 'o1').subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7');
      expect(req.request.body).toEqual({ pins: ['o2'] });
      req.flush(pinned());
    });

    it('publishes the pin list', () => {
      service.publishPins(EAGLE_ID).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7');
      expect(req.request.body).toEqual({ pinsPublished: true });
      req.flush(pinned());
    });

    it('unpublishes the pin list', () => {
      service.unpublishPins(EAGLE_ID).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7');
      expect(req.request.body).toEqual({ pinsPublished: false });
      req.flush(pinned());
    });

    describe('with the HTTP cache', () => {
      beforeEach(() => {
        HttpCacheService.clear();
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(withInterceptors([httpCacheInterceptor])),
            provideHttpClientTesting(),
            { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api', lists: LISTS } },
            { provide: KeycloakService, useValue: { keycloakEnabled: true } },
            { provide: ToastService, useValue: toast },
            { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
          ]
        });
        service = TestBed.inject(ProjectService);
        http = TestBed.inject(HttpTestingController);
      });

      afterEach(() => HttpCacheService.clear());

      it('builds the write on a fresh read, not the cached one', () => {
        service.getNative(EAGLE_ID).subscribe();
        http.expectOne(`/demi/api/projects/${EAGLE_ID}`).flush(nativeRow({ pins: [{ _id: 'o1', name: 'Tsawout' }] }));

        service.addPins(EAGLE_ID, ['o3']).subscribe();
        answerRead();

        expect(http.expectOne('/demi/api/projects/7').request.body).toEqual({ pins: ['o1', 'o2', 'o3'] });
      });
    });
  });

  describe('project writes', () => {
    // The edit form saves `new Project` over its values, with `_id` the route id.
    const formProject = (form: object = {}) => new Project({
      _id: EAGLE_ID, name: 'Ashcroft Ranch Landfill', type: 'Waste', location: 'Ashcroft', proponent: 'org1',
      centroid: [-121.24, 50.72], activeStatus: 'active', ...form
    });

    function answerRead(row: Partial<DemiProject> = {}) {
      http.expectOne(`/demi/api/projects/${EAGLE_ID}`).flush(nativeRow({ proponentId: 'org1', ...row }));
    }

    it('save body has no _id and no activeStatus, and isActive carries the form value', () => {
      service.save(formProject()).subscribe();
      answerRead();

      const body = http.expectOne('/demi/api/projects/7').request.body;
      expect('_id' in body).toBeFalse();
      expect('activeStatus' in body).toBeFalse();
      expect(body.isActive).toBe('active');
    });

    it('save PUTs projects/<row.id> with projectType, address, proponentId and a GeoJSON centroid', () => {
      service.save(formProject()).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.projectType).toBe('Waste');
      expect(req.request.body.address).toBe('Ashcroft');
      expect(req.request.body.proponentId).toBe('org1');
      expect(req.request.body.centroid).toEqual({ type: 'Point', coordinates: [-121.24, 50.72] });
      req.flush(nativeRow());
    });

    it('save stores the name of a newly picked proponent', () => {
      service.save(formProject({ proponent: 'org2' })).subscribe();
      answerRead();
      http.expectOne('/demi/api/organizations/org2').flush({ id: 'org2', name: 'Teck Coal' });

      expect(http.expectOne('/demi/api/projects/7').request.body.proponentName).toBe('Teck Coal');
    });

    it('publish PUTs level 4 with confirm and reason, without legislationYear', () => {
      service.publish(formProject({ legislationYear: 2018 })).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7/level');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ level: 4, confirm: true, reason: 'Published in EPIC admin' });
      req.flush(nativeRow());
    });

    it('unPublish PUTs level 2', () => {
      service.unPublish(EAGLE_ID).subscribe();
      answerRead();

      expect(http.expectOne('/demi/api/projects/7/level').request.body).toEqual({ level: 2 });
    });

    it('addExtension POSTs projects/<demiId>/extensions with only type, appliedTo, start, end', () => {
      const extension = { type: 'Extension', appliedTo: 'Review', start: '2026-01-05', end: '2026-02-05', id: 'x', old: {} };

      service.addExtension(EAGLE_ID, extension).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7/extensions');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ type: 'Extension', appliedTo: 'Review', start: '2026-01-05', end: '2026-02-05' });
    });

    it('a DEMI 409 surfaces its message', async () => {
      const save = firstValueFrom(service.save(formProject()));
      answerRead();

      http.expectOne('/demi/api/projects/7').flush(
        { error: 'Project is under the 2002 Environmental Assessment Act' }, { status: 409, statusText: 'Conflict' }
      );

      await expectAsync(save).toBeRejectedWithError('Project is under the 2002 Environmental Assessment Act');
    });
  });

  describe('group writes', () => {
    it('maps a native row to its Eagle id before adding a group', () => {
      service.addGroup(nativeRow(), 'Working Group').subscribe();

      const req = http.expectOne(`/api/project/${EAGLE_ID}/group`);
      expect(req.request.body).toEqual({ group: 'Working Group' });
      req.flush({});
    });

    it('refuses to write a project without an Eagle id', async () => {
      const write = firstValueFrom(service.addGroup(nativeRow({ eagleId: null }), 'Working Group'));

      await expectAsync(write).toBeRejectedWithError(READ_ONLY_PROJECT);
      http.expectNone(r => r.url.startsWith('/api/project'));
    });
  });
});
