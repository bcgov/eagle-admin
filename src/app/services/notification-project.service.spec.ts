import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { NotificationProjectService, NotificationWrite } from './notification-project.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { DemiNotification, legacyNotification } from '../models/demi/notification';

const NATIVE = {
  id: '6a3c4c034e547e4250daf03b',
  eagleId: '6a3c4c034e547e4250daf03b',
  sourceSystem: 'eagle',
  name: 'Lynn Valley Coal Mine PN',
  associatedProjectId: '5885109faaecd9001b81314c',
  pcp: 'none',
  isPublished: true
} as DemiNotification;

describe('NotificationProjectService', () => {
  let service: NotificationProjectService;
  let http: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: ToastService, useValue: toast }
      ]
    });
    service = TestBed.inject(NotificationProjectService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('listNative', () => {
    it('sends the page, sort, keywords and native filters to DEMI and returns rows with the total', async () => {
      const page = firstValueFrom(service.listNative({
        page: 2, pageSize: 10, count: true, sort: '-name', q: 'coal',
        filters: { type: 'Mines', region: 'Lower Mainland', pcp: 'none', decision: 'In Progress' }
      }));

      const req = http.expectOne(r => r.url === '/demi/api/notifications');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.get('count')).toBe('true');
      expect(req.request.params.get('sort')).toBe('-name');
      expect(req.request.params.get('q')).toBe('coal');
      expect(req.request.params.get('type')).toBe('Mines');
      expect(req.request.params.get('region')).toBe('Lower Mainland');
      expect(req.request.params.get('pcp')).toBe('none');
      expect(req.request.params.get('decision')).toBe('In Progress');
      req.flush([NATIVE], { headers: { 'x-total-count': '13' } });

      const res = await page;
      expect(res.total).toBe(13);
      expect(res.rows[0].id).toBe(NATIVE.id);
    });

    it('shows an error and returns no rows when DEMI fails', async () => {
      const page = firstValueFrom(service.listNative());
      http.expectOne(r => r.url === '/demi/api/notifications').flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

      expect((await page).rows).toEqual([]);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('getNative', () => {
    it('reads one notification by its id', async () => {
      const row = firstValueFrom(service.getNative(NATIVE.id));
      http.expectOne(`/demi/api/notifications/${NATIVE.id}`).flush(NATIVE);

      expect((await row)?.name).toBe(NATIVE.name);
    });

    it('returns null when the notification cannot be read', async () => {
      const row = firstValueFrom(service.getNative('missing'));
      http.expectOne('/demi/api/notifications/missing').flush({ error: 'Notification not found' }, { status: 404, statusText: 'Not Found' });

      expect(await row).toBeNull();
    });
  });

  describe('getAll', () => {
    it('maps the table sort to DEMI and returns Eagle-keyed notifications', async () => {
      const all = firstValueFrom(service.getAll(1, 1000, '+name'));

      const req = http.expectOne(r => r.url === '/demi/api/notifications');
      expect(req.request.params.get('pageSize')).toBe('1000');
      expect(req.request.params.get('sort')).toBe('name');
      req.flush([NATIVE]);

      const res = await all;
      expect(res.totalCount).toBe(1);
      expect(res.data[0]._id).toBe(NATIVE.eagleId);
    });
  });

  describe('writes', () => {
    const DEMI_ID = '0b0f3c9e-5d0a-4a8e-9a43-0c1d2e3f4a5b';
    const FIELDS = { name: 'Lynn Valley Coal Mine PN', notificationThresholdValue: 75, centroid: ['49.3', '-123.0'] };

    it('save PUTs notifications/<demiId>, then /publish when publish=true on an unpublished row', async () => {
      const saved = firstValueFrom(service.save(DEMI_ID, FIELDS, true));

      const put = http.expectOne(`/demi/api/notifications/${DEMI_ID}`);
      expect(put.request.method).toBe('PUT');
      expect(put.request.body.name).toBe('Lynn Valley Coal Mine PN');
      put.flush({ ...NATIVE, id: DEMI_ID, isPublished: false });

      const publish = http.expectOne(`/demi/api/notifications/${DEMI_ID}/publish`);
      expect(publish.request.method).toBe('PUT');
      publish.flush({ ...NATIVE, id: DEMI_ID, isPublished: true });

      expect((await saved).isPublished).toBeTrue();
    });

    it('save sends no publish action when the row already has the asked state', async () => {
      const saved = firstValueFrom(service.save(DEMI_ID, FIELDS, false));

      http.expectOne(`/demi/api/notifications/${DEMI_ID}`).flush({ ...NATIVE, id: DEMI_ID, isPublished: false });

      expect((await saved).id).toBe(DEMI_ID);
      http.expectNone(`/demi/api/notifications/${DEMI_ID}/unpublish`);
    });

    it('save sends a cleared field as null, since DEMI keeps any field left out', () => {
      service.save(DEMI_ID, { ...FIELDS, associatedProjectId: undefined }).subscribe();

      const put = http.expectOne(`/demi/api/notifications/${DEMI_ID}`);
      expect(put.request.body.associatedProjectId).toBeNull();
      put.flush(NATIVE);
    });

    it('add POSTs isPublished and no _id', () => {
      const legacy = legacyNotification({ ...NATIVE, id: DEMI_ID });
      service.add(legacy as NotificationWrite, true).subscribe();

      const post = http.expectOne('/demi/api/notifications');
      expect(post.request.method).toBe('POST');
      expect(post.request.body.isPublished).toBeTrue();
      expect(Object.keys(post.request.body)).not.toContain('_id');
      expect(Object.keys(post.request.body)).not.toContain('demiId');
      expect(Object.keys(post.request.body)).not.toContain('read');
      post.flush(NATIVE);
    });

    it('unpublish PUTs notifications/<demiId>/unpublish', () => {
      service.unpublish(DEMI_ID).subscribe();

      http.expectOne(`/demi/api/notifications/${DEMI_ID}/unpublish`).flush(NATIVE);
    });

    it('a 400 toasts DEMI\'s field text and completes with no value', async () => {
      const saved = firstValueFrom(service.save(DEMI_ID, { notificationThresholdValue: '75' as unknown as number }), { defaultValue: 'none' });

      http.expectOne(`/demi/api/notifications/${DEMI_ID}`).flush(
        { error: 'Invalid request body.', fields: { notificationThresholdValue: 'must be a number' } },
        { status: 400, statusText: 'Bad Request' });

      expect(await saved).toBe('none');
      expect(toast.error).toHaveBeenCalledOnceWith(
        'Failed to save project notification. Invalid request body. notificationThresholdValue: must be a number');
    });
  });
});
