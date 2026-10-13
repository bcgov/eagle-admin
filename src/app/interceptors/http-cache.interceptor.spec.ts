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
});
