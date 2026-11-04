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
import { nativeCommentPeriod } from '../models/demi/comment-period.fixture';

const EAGLE_PERIOD = '5d0a6c1b2e3f4a5b6c7d8e9f';
const EAGLE_PROJECT = '588511d0aaecd9001b826192';

function nativePeriod(overrides: Partial<DemiCommentPeriod> = {}): DemiCommentPeriod {
  return nativeCommentPeriod({ id: EAGLE_PERIOD, eagleId: EAGLE_PERIOD, projectEagleId: EAGLE_PROJECT, ...overrides });
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

  describe('writes', () => {
    const DEMI_PERIOD = '3f2b8a1e-6c1d-4b8e-9f3a-2d7c5e0a1b4c';
    const ABOVE_PROJECT = 'Cannot publish a comment period above the level of its project.';
    const period = () => Object.assign(new CommentPeriod({ ...nativePeriod({ commentTip: 'Be brief' }), _id: EAGLE_PERIOD, project: EAGLE_PROJECT }), { demiId: DEMI_PERIOD });

    it('save PUTs comment-periods/<demiId> with only UPDATE fields', () => {
      service.save(period()).subscribe();

      const req = http.expectOne(`/demi/api/comment-periods/${DEMI_PERIOD}`);
      expect(req.request.method).toBe('PUT');
      expect(Object.keys(req.request.body).sort()).toEqual([
        'commentTip', 'dateCompleted', 'dateStarted', 'instructions', 'isMet', 'milestone', 'openHouses', 'relatedDocuments'
      ]);
      req.flush(nativePeriod());
    });

    it('add POSTs the parent id as projectId and leaves out unset fields DEMI would refuse as null', () => {
      service.add(new CommentPeriod({ instructions: 'Comment here', isPublished: false }), DEMI_PERIOD).subscribe();

      const req = http.expectOne('/demi/api/comment-periods');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ instructions: 'Comment here', isPublished: false, milestone: null, projectId: DEMI_PERIOD });
      req.flush(nativePeriod());
    });

    it('sets a changed published state after the save', () => {
      service.save(period(), false).subscribe();

      http.expectOne(`/demi/api/comment-periods/${DEMI_PERIOD}`).flush(nativePeriod());
      const req = http.expectOne(`/demi/api/comment-periods/${DEMI_PERIOD}/unpublish`);
      expect(req.request.method).toBe('PUT');
      req.flush(nativePeriod({ isPublished: false }));
    });

    it('says the period was saved when only setting its published state is refused', async () => {
      const result = firstValueFrom(service.save(period(), true));

      http.expectOne(`/demi/api/comment-periods/${DEMI_PERIOD}`).flush(nativePeriod());
      http.expectOne(`/demi/api/comment-periods/${DEMI_PERIOD}/publish`).flush({ error: ABOVE_PROJECT }, { status: 409, statusText: 'Conflict' });

      await expectAsync(result).toBeRejected();
      expect(TestBed.inject(ToastService).error).toHaveBeenCalledOnceWith(`Comment period saved, but it was not published. ${ABOVE_PROJECT}`);
    });

    it('toasts DEMI\'s reason and fails the stream when a write is refused', async () => {
      const result = firstValueFrom(service.delete(period()));

      const req = http.expectOne(`/demi/api/comment-periods/${DEMI_PERIOD}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ error: 'This comment period is run in ENGAGE. Change it there.' }, { status: 409, statusText: 'Conflict' });

      await expectAsync(result).toBeRejected();
      expect(TestBed.inject(ToastService).error)
        .toHaveBeenCalledWith('Failed to delete comment period. This comment period is run in ENGAGE. Change it there.');
    });
  });
});
