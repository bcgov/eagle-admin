import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HttpCacheService, httpCacheInterceptor } from './http-cache.interceptor';
import { ConfigService } from '../services/config.service';
import { LoggingService } from '../services/logging.service';

describe('httpCacheInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    HttpCacheService.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpCacheInterceptor])),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    HttpCacheService.clear();
  });

  // Loads `url` once so the next GET of it is served from the cache.
  const prime = (url: string) => {
    client.get(url).subscribe();
    http.expectOne(url).flush([]);
  };

  // True when a GET of `url` reaches the network instead of the cache.
  const refetches = (url: string) => {
    client.get(url).subscribe();
    const hits = http.match(url);
    hits.forEach(req => req.flush([]));
    return hits.length > 0;
  };

  it('serves a repeated DEMI read from the cache', () => {
    prime('/demi/api/projects?page=1');

    expect(refetches('/demi/api/projects?page=1')).toBeFalse();
  });

  it('drops every cached DEMI read after an eagle-api write, whatever the kind', () => {
    prime('/demi/api/projects?page=1');
    prime('/demi/api/organizations/o1');

    client.put('/api/project/p1', {}).subscribe();
    http.expectOne('/api/project/p1').flush({});

    expect(refetches('/demi/api/projects?page=1')).toBeTrue();
    expect(refetches('/demi/api/organizations/o1')).toBeTrue();
  });

  it('drops every cached DEMI read after a DEMI write, whatever the kind', () => {
    prime('/demi/api/users?ids=u1');
    prime('/demi/api/projects?page=1');

    client.put('/demi/api/organizations/o1', {}).subscribe();
    http.expectOne('/demi/api/organizations/o1').flush({});

    expect(refetches('/demi/api/users?ids=u1')).toBeTrue();
    expect(refetches('/demi/api/projects?page=1')).toBeTrue();
  });

  it('keeps cached DEMI reads when the DEMI write fails', () => {
    prime('/demi/api/users');

    client.delete('/demi/api/groups/g1').subscribe({ error: () => undefined });
    http.expectOne('/demi/api/groups/g1').flush({ error: 'Forbidden.' }, { status: 403, statusText: 'Forbidden' });

    expect(refetches('/demi/api/users')).toBeFalse();
  });

  it('keeps cached DEMI reads when the eagle-api write fails', () => {
    prime('/demi/api/projects');

    client.put('/api/project/p1', {}).subscribe({ error: () => undefined });
    http.expectOne('/api/project/p1').flush({}, { status: 500, statusText: 'Server Error' });

    expect(refetches('/demi/api/projects')).toBeFalse();
  });

  it('keeps cached eagle-api reads of other kinds after an eagle-api write', () => {
    prime('/api/organization/o1');

    client.put('/api/project/p1', {}).subscribe();
    http.expectOne('/api/project/p1').flush({});

    expect(refetches('/api/organization/o1')).toBeFalse();
  });

  it('keeps cached DEMI reads after a write to another path', () => {
    prime('/demi/api/projects');

    client.post('/analytics/event', {}).subscribe();
    http.expectOne('/analytics/event').flush({});

    expect(refetches('/demi/api/projects')).toBeFalse();
  });

  it('serves the row a fresh DEMI read got, not the older cached one', () => {
    const url = '/demi/api/projects/p1';
    client.get(url).subscribe();
    http.expectOne(url).flush({ name: 'Old' });
    client.get(url, { headers: { 'cache-control': 'no-cache' } }).subscribe();
    http.expectOne(url).flush({ name: 'New' });

    let served: unknown;
    client.get(url).subscribe(body => served = body);

    http.expectNone(url);
    expect(served).toEqual({ name: 'New' });
  });

  it('keeps the cached row when a fresh DEMI read fails', () => {
    const url = '/demi/api/projects/p1';
    client.get(url).subscribe();
    http.expectOne(url).flush({ name: 'Old' });
    client.get(url, { headers: { 'cache-control': 'no-cache' } }).subscribe({ error: () => undefined });
    http.expectOne(url).flush({ error: 'Server error' }, { status: 500, statusText: 'Server Error' });

    let served: unknown;
    client.get(url).subscribe(body => served = body);

    http.expectNone(url);
    expect(served).toEqual({ name: 'Old' });
  });

  it('does not cache a fresh read outside the DEMI path', () => {
    client.get('/api/project/p1', { headers: { 'cache-control': 'no-cache' } }).subscribe();
    http.expectOne('/api/project/p1').flush({});

    expect(refetches('/api/project/p1')).toBeTrue();
  });

  it('keeps a fresh DEMI read over an older cached read that finishes after it', () => {
    const url = '/demi/api/projects/p1';
    client.get(url).subscribe();
    client.get(url, { headers: { 'cache-control': 'no-cache' } }).subscribe();
    const [older, fresh] = http.match(url);
    fresh.flush({ name: 'New' });
    older.flush({ name: 'Old' });

    let served: unknown;
    client.get(url).subscribe(body => served = body);

    http.expectNone(url);
    expect(served).toEqual({ name: 'New' });
  });
});
