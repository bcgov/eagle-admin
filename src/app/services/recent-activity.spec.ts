import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { RecentActivityService, toEagleUpdateBody } from './recent-activity';
import { RecentActivity } from '../models/recentActivity';
import { DemiUpdate } from '../models/demi/update';

const EAGLE_PROJECT = '5885109faaecd9001b81314c';

function nativeRow(overrides: Partial<DemiUpdate> = {}): DemiUpdate {
  return {
    id: '6ab70323ba6fdbe023b0569f', eagleId: '6ab70323ba6fdbe023b0569f', projectId: EAGLE_PROJECT,
    projectEagleId: EAGLE_PROJECT, projectName: 'Site C', isPublished: true,
    headline: 'News', content: '<p>x</p>', type: 'News', pinned: false, dateAdded: '2026-09-25T23:26:27.075Z',
    dateUpdated: '2026-09-26T00:00:00.000Z', active: true, notificationName: null, contentUrl: null, documentUrl: null,
    pcp: null, projectNotification: null, category: 'Project News', subject: null, shortHeadline: null, summary: null,
    featuredImage: null, images: [], attachments: [], regions: [], location: null, engagementUrl: null,
    status: 'published', publishDate: '2026-09-25T23:26:27.044Z',
    ...overrides
  };
}

describe('toEagleUpdateBody', () => {
  it('sends a legacy body unchanged', () => {
    const legacy = new RecentActivity({ _id: 'a1', project: 'p1' });
    expect(toEagleUpdateBody(legacy)).toBe(legacy);
  });

  it('maps a native row to its Eagle id and Eagle project id, without DEMI-only fields', () => {
    const body = toEagleUpdateBody(nativeRow());

    expect(body._id).toBe('6ab70323ba6fdbe023b0569f');
    expect(body.project).toBe(EAGLE_PROJECT);
    expect(body.headline).toBe('News');
    ['id', 'eagleId', 'projectId', 'projectEagleId', 'projectName', 'isPublished'].forEach(field =>
      expect(body).not.toEqual(jasmine.objectContaining({ [field]: jasmine.anything() })));
  });

  it('keeps a project notification parent, which has no joined projectEagleId', () => {
    const body = toEagleUpdateBody(nativeRow({ projectId: '629f6cf1b9bf2900227acc04', projectEagleId: undefined }));
    expect(body.project).toBe('629f6cf1b9bf2900227acc04');
  });

  it('refuses a native row with no Eagle id', () => {
    expect(() => toEagleUpdateBody(nativeRow({ id: 'demi-only', eagleId: null }))).toThrowError(/not in Eagle/);
  });
});

describe('RecentActivityService', () => {
  let service: RecentActivityService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        KeycloakService
      ]
    });
    service = TestBed.inject(RecentActivityService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists native updates by Eagle project id, with a count', async () => {
    const result = firstValueFrom(service.list({ page: 2, pageSize: 25, sort: '-dateAdded', filters: { project: EAGLE_PROJECT } }));

    const req = http.expectOne(r => r.url === '/demi/api/updates');
    expect(req.request.params.get('project')).toBe(EAGLE_PROJECT);
    expect(req.request.params.get('count')).toBe('true');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('sort')).toBe('-dateAdded');
    req.flush([nativeRow()], { headers: { 'x-total-count': '7' } });

    expect((await result).total).toBe(7);
  });

  it('sends repeated projects, the date range and the C&E flag under their DEMI names', async () => {
    const page = firstValueFrom(service.list({
      sort: '-pinned',
      filters: { project: ['p1', 'p2'], dateAddedStart: '2024-01-01', dateAddedEnd: '2024-12-31', complianceAndEnforcement: 'true' }
    }));

    const req = http.expectOne(r => r.url === '/demi/api/updates');
    expect(req.request.urlWithParams).toBe('/demi/api/updates?count=true&sort=-pinned&project=p1&project=p2'
      + '&dateAddedStart=2024-01-01&dateAddedEnd=2024-12-31&complianceAndEnforcement=true');
    req.flush([]);
    await page;
  });

  it('reads one native update by id', async () => {
    const result = firstValueFrom(service.getNative('6ab70323ba6fdbe023b0569f'));

    http.expectOne('/demi/api/updates/6ab70323ba6fdbe023b0569f').flush(nativeRow());

    expect((await result).headline).toBe('News');
  });

  it('saves a native row to eagle-api with the Eagle project id in the body', async () => {
    const result = firstValueFrom(service.save(nativeRow({ pinned: true })));

    const req = http.expectOne('/api/recentActivity/6ab70323ba6fdbe023b0569f');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.project).toBe(EAGLE_PROJECT);
    expect(req.request.body.pinned).toBeTrue();
    expect(req.request.body.projectId).toBeUndefined();
    req.flush({ _id: '6ab70323ba6fdbe023b0569f', dateUpdated: '2026-10-01T00:00:00.000Z' });

    expect((await result).dateUpdated).toBe('2026-10-01T00:00:00.000Z');
  });

  it('archives a native row through the DELETE route under its Eagle id', async () => {
    const result = firstValueFrom(service.archive(nativeRow()));

    const req = http.expectOne('/api/recentActivity/6ab70323ba6fdbe023b0569f');
    expect(req.request.method).toBe('DELETE');
    req.flush({ _id: '6ab70323ba6fdbe023b0569f', status: 'archived' });

    expect((await result).status).toBe('archived');
  });

  it('archives a legacy row through the DELETE route, which the API turns into status archived', async () => {
    const result = firstValueFrom(service.archive(new RecentActivity({ _id: 'a1' })));

    const req = http.expectOne('/api/recentActivity/a1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ _id: 'a1', status: 'archived' });

    expect((await result).status).toBe('archived');
  });

  it('passes a 409 from save through with its status, so the form can say the row changed', async () => {
    const result = firstValueFrom(service.save(new RecentActivity({ _id: 'a1', dateUpdated: 'stale' })));

    http.expectOne('/api/recentActivity/a1').flush(null, { status: 409, statusText: 'Conflict' });

    await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({ status: 409 }));
  });

  it('fails the stream, without a request, for a native row with no Eagle id', async () => {
    const result = firstValueFrom(service.save(nativeRow({ id: 'demi-only', eagleId: null })));

    await expectAsync(result).toBeRejected();
    http.expectNone(() => true);
  });
});
