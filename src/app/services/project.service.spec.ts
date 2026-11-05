import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from './config.service';
import { HttpCacheService, httpCacheInterceptor } from '../interceptors/http-cache.interceptor';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ProjectCreatedPartlyError, ProjectService, otherActMessage } from './project.service';
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

    it('getPeopleObjs answers once, after every block has its contacts', () => {
      const legislation2002 = { name: 'Old Mine', responsibleEPDId: 'u1' } as any;
      const legislation2018 = { name: 'Mine', responsibleEPDId: 'u2' } as any;
      const data = [{ data: { searchResults: [{ legislationYearList: [2002, 2018], legislation_2002: legislation2002, legislation_2018: legislation2018 }] } }];
      const answers: (string | undefined)[] = [];

      service.getPeopleObjs(data).subscribe(() => answers.push(legislation2018.responsibleEPDObj?._id));
      const [first, second] = http.match(r => r.url === '/demi/api/users');
      first.flush([{ id: 'u1' }]);
      second.flush([{ id: 'u2' }]);

      expect(answers).toEqual(['u2']);
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

    it('save writes only the fields the tab holds', () => {
      service.save(formProject(), ['name', 'location']).subscribe();
      answerRead({ eaStatusDate: '2024-03-15T07:00:00.000Z' });

      const body = http.expectOne('/demi/api/projects/7').request.body;
      expect(body.address).toBe('Ashcroft');
      expect('eaStatusDate' in body).toBeFalse();
      expect('projectType' in body).toBeFalse();
    });

    it('save PUTs projects/<row.id> with projectType, address and a GeoJSON centroid', () => {
      service.save(formProject()).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.projectType).toBe('Waste');
      expect(req.request.body.address).toBe('Ashcroft');
      expect(req.request.body.centroid).toEqual({ type: 'Point', coordinates: [-121.24, 50.72] });
      req.flush(nativeRow());
    });

    it('save stores the name of a newly picked proponent', () => {
      service.save(formProject({ proponent: 'org2' })).subscribe();
      answerRead();
      http.expectOne('/demi/api/organizations/org2').flush({ id: 'org2', name: 'Teck Coal' });

      const body = http.expectOne('/demi/api/projects/7').request.body;
      expect(body.proponentId).toBe('org2');
      expect(body.proponentName).toBe('Teck Coal');
    });

    it('a failed proponent lookup fails the save and sends no PUT', async () => {
      const save = firstValueFrom(service.save(formProject({ proponent: 'org2' })));
      answerRead();

      http.expectOne('/demi/api/organizations/org2').flush({ error: 'Organization not found' }, { status: 404, statusText: 'Not Found' });

      await expectAsync(save).toBeRejectedWithError('Organization not found');
      http.expectNone('/demi/api/projects/7');
    });

    it('save from the tab of the project\'s own Act PUTs the form', () => {
      service.save(formProject({ legislationYear: 2018 })).subscribe();
      answerRead({ legislationYear: 2018 });

      expect(http.expectOne('/demi/api/projects/7').request.method).toBe('PUT');
    });

    it('save from another Act\'s tab is refused and sends no PUT', async () => {
      const save = firstValueFrom(service.save(formProject({ legislationYear: 2018 })));
      answerRead({ legislationYear: 2002 });

      await expectAsync(save).toBeRejectedWithError(otherActMessage(2002, 2018));
      http.expectNone('/demi/api/projects/7');
    });

    it('save from another Act\'s tab is refused when only the block key and label name the Act', async () => {
      const save = firstValueFrom(service.save(formProject({ legislationYear: 2018 })));
      answerRead({ currentLegislationYear: 'legislation_2002', legislation: '2002 Environmental Assessment Act' });

      await expectAsync(save).toBeRejectedWithError(otherActMessage(2002, 2018));
      http.expectNone('/demi/api/projects/7');
    });

    it('save on a row that names no Act PUTs the form', () => {
      service.save(formProject({ legislationYear: 2018 })).subscribe({ error: () => undefined });
      answerRead();

      expect(http.expectOne('/demi/api/projects/7').request.method).toBe('PUT');
    });

    describe('over the row the form was built from', () => {
      const PHASE1 = { _id: 'phase1', name: 'Pre-Application' };
      const PHASE2 = { _id: 'phase2', name: 'Application Review' };
      const shown = nativeRow({ proponentId: 'org1', currentPhaseName: PHASE1, phaseHistory: [PHASE1] });

      it('leaves out a List field the form did not change, though another user changed it since', () => {
        service.save(formProject({ currentPhaseName: 'phase1' }), undefined, shown).subscribe();
        answerRead({ currentPhaseName: PHASE2, phaseHistory: [PHASE1, PHASE2] });

        expect('currentPhaseName' in http.expectOne('/demi/api/projects/7').request.body).toBeFalse();
      });

      it('appends a new phase to the stored phase history, not the shown one', () => {
        service.save(formProject({ currentPhaseName: 'phase3' }), undefined, shown).subscribe();
        answerRead({ currentPhaseName: PHASE2, phaseHistory: [PHASE1, PHASE2] });

        const history = http.expectOne('/demi/api/projects/7').request.body.phaseHistory as { _id: string }[];
        expect(history.map(ref => ref._id)).toEqual(['phase1', 'phase2', 'phase3']);
      });
    });

    it('publish PUTs level 4 with confirm, reason and the tab\'s legislationYear', () => {
      service.publish(formProject({ legislationYear: 2018 })).subscribe();
      answerRead();

      const req = http.expectOne('/demi/api/projects/7/level');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ level: 4, confirm: true, reason: 'Published in EPIC admin', legislationYear: 2018 });
      req.flush(nativeRow());
    });

    it('unPublish PUTs level 2', () => {
      service.unPublish({ _id: EAGLE_ID }).subscribe();
      answerRead();

      expect(http.expectOne('/demi/api/projects/7/level').request.body).toEqual({ level: 2 });
    });

    it('reads a legacy project by its DEMI id when it carries one', () => {
      service.unPublish({ _id: EAGLE_ID, demiId: '7' }).subscribe();

      http.expectOne('/demi/api/projects/7').flush(nativeRow());
      http.expectOne('/demi/api/projects/7/level').flush(nativeRow());
    });

    describe('create', () => {
      const MINTED = '0b5e6c1a-3f0e-4a8e-9c35-7d2f1e9a4b10';
      const newProject = () => formProject({
        _id: undefined, proponent: { _id: 'org1', name: 'Teck Coal' }, sector: 'Mining', region: 'Thompson-Nicola',
        description: 'Line one\nline two', currentPhaseName: 'phase1', legislationYear: 2018
      });

      const PROJECT_URL = `/demi/api/projects/${MINTED}`;
      const LEVEL_URL = `${PROJECT_URL}/level`;

      function answerCreate() {
        const post = http.expectOne('/demi/api/projects');
        post.flush({ id: MINTED, eagleId: null, name: post.request.body.name });
        return post;
      }

      const refuse = (url: string, error: string) =>
        http.expectOne(url).flush({ error }, { status: 400, statusText: 'Bad Request' });

      it('add POSTs without trackProjectId and with centroid {type: \'Point\', coordinates: [lon, lat]}, then sets level 2, then PUTs the rest with legislationYear to the returned id', async () => {
        const created = firstValueFrom(service.add(newProject()));

        const post = answerCreate();
        expect(post.request.method).toBe('POST');
        expect(post.request.body).toEqual({
          name: 'Ashcroft Ranch Landfill', description: 'Line one\nline two', sector: 'Mining', region: 'Thompson-Nicola',
          projectState: 'Pre-Application', centroid: { type: 'Point', coordinates: [-121.24, 50.72] }
        });
        http.expectNone(PROJECT_URL);
        const level = http.expectOne(LEVEL_URL);
        expect(level.request.body).toEqual({ level: 2 });
        level.flush({ id: MINTED, eagleId: null });
        const put = http.expectOne(PROJECT_URL);
        expect(put.request.method).toBe('PUT');
        expect(put.request.body).toEqual(jasmine.objectContaining({
          legislationYear: 2018, projectType: 'Waste', address: 'Ashcroft', proponentId: 'org1', proponentName: 'Teck Coal'
        }));
        put.flush({ id: MINTED });

        expect((await created).demiId).toBe(MINTED);
      });

      it('add-and-publish sets level 4 with confirm and reason after the PUT', () => {
        service.add(newProject(), { publish: true }).subscribe();
        answerCreate();
        http.expectOne(LEVEL_URL).flush({ id: MINTED });
        http.expectNone(LEVEL_URL);
        http.expectOne(PROJECT_URL).flush({ id: MINTED });

        expect(http.expectOne(LEVEL_URL).request.body)
          .toEqual({ level: 4, confirm: true, reason: 'Published in EPIC admin', legislationYear: 2018 });
      });

      it('a refused POST fails with DEMI\'s message and sends nothing more', async () => {
        const created = firstValueFrom(service.add(newProject(), { publish: true }));
        refuse('/demi/api/projects', 'Missing required fields: name, centroid');

        const error = await created.catch(e => e);
        expect(error instanceof ProjectCreatedPartlyError).toBeFalse();
        expect(error.message).toBe('Missing required fields: name, centroid');
      });

      describe('a step after the POST fails with the new id and names that step', () => {
        async function failAt(failing: 'opening' | 'saving' | 'publishing') {
          const created = firstValueFrom(service.add(newProject(), { publish: true }));
          answerCreate();
          for (const [step, url] of [['opening', LEVEL_URL], ['saving', PROJECT_URL], ['publishing', LEVEL_URL]]) {
            if (step === failing) {
              refuse(url, 'Unknown field: foo');
              break;
            }
            http.expectOne(url).flush({ id: MINTED });
          }
          const error = await created.catch(e => e);
          expect(error instanceof ProjectCreatedPartlyError).toBeTrue();
          expect(error.id).toBe(MINTED);
          expect(error.cause.message).toBe('Unknown field: foo');
          return error as ProjectCreatedPartlyError;
        }

        it('level 2', async () => {
          const error = await failAt('opening');
          expect(error.message).toBe('Project created, but it could not be opened to staff: Unknown field: foo');
          expect(error.saved).toBeFalse();
        });

        it('the PUT', async () => {
          const error = await failAt('saving');
          expect(error.message).toBe('Project created, but not every field was saved: Unknown field: foo');
          expect(error.saved).toBeFalse();
        });

        it('publishing after the PUT', async () => {
          const error = await failAt('publishing');
          expect(error.message).toBe('Project created and saved, but not published: Unknown field: foo');
          expect(error.saved).toBeTrue();
        });
      });
    });

    describe('extensions', () => {
      const EXTENSION = { type: 'Extension', appliedTo: 'Review', start: '2026-01-05', end: '2026-02-05' };

      it('addExtension POSTs projects/<demiId>/extensions with only type, appliedTo, start, end', () => {
        service.addExtension({ _id: EAGLE_ID }, { ...EXTENSION, id: 'x', old: {} } as typeof EXTENSION).subscribe();
        answerRead();

        const req = http.expectOne('/demi/api/projects/7/extensions');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(EXTENSION);
      });

      it('editExtension PUTs the new item to the old item\'s id', () => {
        service.editExtension({ _id: EAGLE_ID }, { new: EXTENSION, old: { id: 'e1' } }).subscribe();
        answerRead();

        const req = http.expectOne('/demi/api/projects/7/extensions/e1');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(EXTENSION);
      });

      it('deleteExtension DELETEs the item by id', () => {
        service.deleteExtension({ _id: EAGLE_ID }, { id: 'e1' }).subscribe();
        answerRead();

        expect(http.expectOne('/demi/api/projects/7/extensions/e1').request.method).toBe('DELETE');
      });
    });

    it('a DEMI 409 surfaces its message', async () => {
      const save = firstValueFrom(service.save(formProject()));
      answerRead();

      http.expectOne('/demi/api/projects/7').flush(
        { error: 'Project is under the Building Canada Act' }, { status: 409, statusText: 'Conflict' }
      );

      await expectAsync(save).toBeRejectedWithError('Project is under the Building Canada Act');
    });
  });
});
