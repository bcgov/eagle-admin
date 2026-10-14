import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { CommentPeriodService } from './commentperiod.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { CommentPeriod } from '../models/commentPeriod';
import { DemiCommentPeriod } from '../models/demi/comment-period';

const EAGLE_PERIOD = '5d0a6c1b2e3f4a5b6c7d8e9f';
const EAGLE_PROJECT = '588511d0aaecd9001b826192';

function nativePeriod(overrides: Partial<DemiCommentPeriod> = {}): DemiCommentPeriod {
  return {
    id: EAGLE_PERIOD, eagleId: EAGLE_PERIOD, projectId: '207', projectEagleId: EAGLE_PROJECT, projectName: 'Mine',
    sourceSystem: 'eagle', dateStarted: '2026-01-01T00:00:00Z', dateCompleted: '2026-02-01T00:00:00Z', dateAdded: null,
    isMet: false, metURL: '', informationLabel: '', instructions: 'Comment here', additionalText: '', commentTip: '',
    openHouses: [], relatedDocuments: [], milestone: '5c0a6c1b2e3f4a5b6c7d8e00', isPublished: true,
    ...overrides
  };
}

describe('CommentPeriodService', () => {
  let service: CommentPeriodService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) }
      ]
    });
    service = TestBed.inject(CommentPeriodService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('native reads', () => {
    it('lists a project\'s periods from /comment-periods with the DEMI project id, sort and count', async () => {
      const result = firstValueFrom(service.listByProject('207', { page: 2, pageSize: 10, sort: '-dateCompleted' }));

      const req = http.expectOne(r => r.url === '/demi/api/comment-periods');
      expect(req.request.params.get('project')).toBe('207');
      expect(req.request.params.get('sort')).toBe('-dateCompleted');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('count')).toBe('true');
      req.flush([nativePeriod()], { headers: { 'x-total-count': '11' } });

      expect((await result).total).toBe(11);
    });

    it('sends each status filter as its own parameter', () => {
      service.listByProject('207', { status: ['open', 'upcoming'] }).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/comment-periods');
      expect(req.request.params.getAll('status')).toEqual(['open', 'upcoming']);
      req.flush([]);
    });

    it('answers an empty page when the list fails', async () => {
      const result = firstValueFrom(service.listByProject('207'));

      http.expectOne(r => r.url === '/demi/api/comment-periods').flush({ error: 'boom' }, { status: 500, statusText: 'Error' });

      expect(await result).toEqual({ rows: [], total: 0 });
    });

    it('reads one period from /comment-periods/:id', async () => {
      const result = firstValueFrom(service.getNative(EAGLE_PERIOD));

      http.expectOne(`/demi/api/comment-periods/${EAGLE_PERIOD}`).flush(nativePeriod());

      expect((await result).projectEagleId).toBe(EAGLE_PROJECT);
    });

    it('answers null when a period cannot be read', async () => {
      const result = firstValueFrom(service.getNative(EAGLE_PERIOD));

      http.expectOne(`/demi/api/comment-periods/${EAGLE_PERIOD}`).flush({ error: 'boom' }, { status: 500, statusText: 'Error' });

      expect(await result).toBeNull();
    });

    it('reads the summary from /comment-periods/:id/summary', async () => {
      const result = firstValueFrom(service.getNativeSummary(EAGLE_PERIOD));

      http.expectOne(`/demi/api/comment-periods/${EAGLE_PERIOD}/summary`)
        .flush({ id: EAGLE_PERIOD, total: 5, eaoStatus: { Pending: 2, Published: 3, Rejected: 0, Deferred: 0 } });

      expect((await result).eaoStatus.Pending).toBe(2);
    });

    it('maps the native summary onto the legacy per-status counts', async () => {
      const result = firstValueFrom(service.getSummaryById(EAGLE_PERIOD));

      http.expectOne(`/demi/api/comment-periods/${EAGLE_PERIOD}/summary`)
        .flush({ id: EAGLE_PERIOD, total: 5, eaoStatus: { Pending: 2, Published: 3, Rejected: 0, Deferred: 0 } });

      const summary = await result;
      expect(summary.Pending).toBe(2);
      expect(summary.Published).toBe(3);
    });

    it('answers a null summary when DEMI cannot read the period', async () => {
      const result = firstValueFrom(service.getSummaryById(EAGLE_PERIOD));

      http.expectOne(`/demi/api/comment-periods/${EAGLE_PERIOD}/summary`)
        .flush({ error: 'Comment period not found' }, { status: 404, statusText: 'Not Found' });

      expect(await result).toBeNull();
    });
  });

  describe('write body', () => {
    it('sends a legacy period to eagle-api unchanged', () => {
      const legacy = new CommentPeriod({ _id: EAGLE_PERIOD, project: EAGLE_PROJECT, instructions: 'Comment here' });

      service.save(legacy).subscribe();

      const req = http.expectOne(`/api/commentperiod/${EAGLE_PERIOD}`);
      expect(req.request.body).toEqual(JSON.parse(JSON.stringify(legacy)));
      req.flush({});
    });

    it('saves a native period under its Eagle id with the Eagle project id', () => {
      service.save(nativePeriod()).subscribe();

      const req = http.expectOne(`/api/commentperiod/${EAGLE_PERIOD}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.project).toBe(EAGLE_PROJECT);
      expect(req.request.body._id).toBe(EAGLE_PERIOD);
      expect(req.request.body.projectId).toBeUndefined();
      req.flush({});
    });

    it('adds a native period with the Eagle project id and no DEMI-only fields', () => {
      service.add(nativePeriod({ id: undefined, eagleId: undefined })).subscribe();

      const req = http.expectOne('/api/commentperiod/');
      expect(req.request.body.project).toBe(EAGLE_PROJECT);
      expect(req.request.body._id).toBeNull();
      expect(Object.keys(req.request.body)).not.toContain('projectEagleId');
      expect(Object.keys(req.request.body)).not.toContain('projectName');
      req.flush({});
    });

    it('saves a native period whose project is hidden without a project field, as eagle-api ignores it on update', () => {
      service.save(nativePeriod({ projectEagleId: undefined })).subscribe();

      const req = http.expectOne(`/api/commentperiod/${EAGLE_PERIOD}`);
      expect(Object.keys(req.request.body)).not.toContain('project');
      req.flush({});
    });

    it('refuses to save a native period read without staff fields, sending nothing', async () => {
      const withoutStaffFields = nativePeriod();
      delete withoutStaffFields.milestone;

      await expectAsync(firstValueFrom(service.save(withoutStaffFields))).toBeRejectedWithError(/staff fields/);
      http.expectNone(() => true);
    });

    it('uses the notification id as project for a notification-parented period', () => {
      const notification = '6a1b2c3d4e5f6a7b8c9d0e1f';

      service.add(nativePeriod({ id: undefined, eagleId: undefined, projectId: notification, projectEagleId: undefined })).subscribe();

      const req = http.expectOne('/api/commentperiod/');
      expect(req.request.body.project).toBe(notification);
      req.flush({});
    });

    it('refuses to add a period whose project has no Eagle id, sending nothing', async () => {
      const result = firstValueFrom(service.add(nativePeriod({ id: undefined, eagleId: undefined, projectEagleId: undefined })));

      await expectAsync(result).toBeRejectedWithError(/not in Eagle/);
      http.expectNone(() => true);
    });

    it('refuses to write an ENGAGE period that has no Eagle id', async () => {
      const result = firstValueFrom(service.publish(nativePeriod({ id: 'engage-42', eagleId: undefined })));

      await expectAsync(result).toBeRejectedWithError(/not in Eagle/);
      http.expectNone(() => true);
    });

    it('refuses to publish an ENGAGE period even when it has an Eagle id', async () => {
      const result = firstValueFrom(service.publish(nativePeriod({ id: 'engage-42', sourceSystem: 'engage' })));

      await expectAsync(result).toBeRejectedWithError(/ENGAGE/);
      http.expectNone(() => true);
    });

    it('publishes a native period with no body', () => {
      service.publish(nativePeriod()).subscribe();

      const req = http.expectOne(`/api/commentperiod/${EAGLE_PERIOD}/publish`);
      expect(req.request.body).toEqual({});
      req.flush({});
    });

    it('unpublishes a native period under its id when it is the Eagle id', () => {
      service.unPublish(nativePeriod({ eagleId: undefined })).subscribe();

      http.expectOne(`/api/commentperiod/${EAGLE_PERIOD}/unpublish`).flush({});
    });

    it('deletes a native period by its Eagle id', () => {
      service.delete(nativePeriod()).subscribe();

      const req = http.expectOne(`/api/commentperiod/${EAGLE_PERIOD}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
