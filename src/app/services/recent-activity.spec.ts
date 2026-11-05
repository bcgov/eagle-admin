import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoadedUpdate, RecentActivityService } from './recent-activity';

const EAGLE_PROJECT = '5885109faaecd9001b81314c';

function loadedRow(overrides: Partial<LoadedUpdate> = {}): LoadedUpdate {
  return {
    id: 'demi-update-1', eagleId: '6ab70323ba6fdbe023b0569f', projectId: EAGLE_PROJECT, _etag: '"etag-1"',
    projectEagleId: EAGLE_PROJECT, projectName: 'Site C', isPublished: true,
    headline: 'News', content: '<p>x</p>', type: 'News', pinned: false, dateAdded: '2026-09-25T23:26:27.075Z',
    dateUpdated: '2026-09-26T00:00:00.000Z', active: true, notificationName: null, contentUrl: null, documentUrl: null,
    pcp: null, projectNotification: null, category: 'Project News', subject: null, shortHeadline: null, summary: null,
    featuredImage: null, images: [], attachments: [], regions: [], location: null, engagementUrl: null,
    status: 'published', publishDate: '2026-09-25T23:26:27.044Z',
    ...overrides
  };
}

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
    req.flush([loadedRow()], { headers: { 'x-total-count': '7' } });

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

  it('reads one update past the HTTP cache, so its _etag is current', async () => {
    const result = firstValueFrom(service.getNative('6ab70323ba6fdbe023b0569f'));

    const req = http.expectOne('/demi/api/updates/6ab70323ba6fdbe023b0569f');
    expect(req.request.headers.get('cache-control')).toBe('no-cache');
    req.flush(loadedRow());

    expect((await result)._etag).toBe('"etag-1"');
  });

  it('save PUTs updates/<id> with projectId and the loaded _etag and no undefined fields', async () => {
    const result = firstValueFrom(service.save(loadedRow({ headline: 'Edited', summary: undefined })));

    const req = http.expectOne('/demi/api/updates/demi-update-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.projectId).toBe(EAGLE_PROJECT);
    expect(req.request.body._etag).toBe('"etag-1"');
    expect(req.request.body.headline).toBe('Edited');
    expect(Object.keys(req.request.body)).not.toContain('summary');
    // DEMI answers 400 to any key outside its write schema.
    ['id', 'eagleId', 'projectEagleId', 'projectName', 'isPublished', 'dateAdded', 'dateUpdated'].forEach(key =>
      expect(Object.keys(req.request.body)).not.toContain(key));
    req.flush(loadedRow({ headline: 'Edited', _etag: '"etag-2"' }));

    expect((await result)._etag).toBe('"etag-2"');
  });

  it('add POSTs every create field the form sets, without the PUT-only pinned and _etag', async () => {
    const created = {
      projectId: EAGLE_PROJECT, headline: 'New', content: '<p>x</p>', type: 'News', active: true, complianceAndEnforcement: false,
      notificationName: null, contentUrl: '', documentUrl: '', pcp: null, projectNotification: 'pn1', category: 'Project News',
      subject: null, shortHeadline: 'Short', summary: 'Sum', attachments: ['d1'], location: 'Kamloops', engagementUrl: null,
      status: 'published' as const, publishDate: '2026-10-01T00:00:00.000Z',
      featuredImage: { document: 'f1', alt: 'Top' }, images: [{ document: 'i1', alt: 'Site', caption: 'Dam' }], regions: ['Thompson-Nicola']
    };
    const result = firstValueFrom(service.add({ ...created, pinned: false, _etag: 'stray' }));

    const req = http.expectOne('/demi/api/updates');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(created);
    req.flush(loadedRow());

    expect((await result).id).toBe('demi-update-1');
  });
});
