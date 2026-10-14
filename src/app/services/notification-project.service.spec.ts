import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { NotificationProjectService } from './notification-project.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { ProjectNotification } from '../models/projectNotification';
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

  describe('save', () => {
    it('puts a notification read from DEMI under its Eagle id with the publish flag', () => {
      const row = legacyNotification({ ...NATIVE, id: 'native-1' });
      service.save(row, true).subscribe();

      const req = http.expectOne('/api/projectNotification/6a3c4c034e547e4250daf03b?publish=true');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(row);
      req.flush({});
    });

    it('puts a legacy notification unchanged', () => {
      const legacy = new ProjectNotification({ _id: 'eagle-1', name: 'Old', associatedProjectId: 'eagle-project-1' });
      service.save(legacy).subscribe();

      const req = http.expectOne('/api/projectNotification/eagle-1');
      expect(req.request.body).toBe(legacy);
      req.flush({});
    });
  });
});
