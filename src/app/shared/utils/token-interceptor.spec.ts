import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject, firstValueFrom } from 'rxjs';

import { TokenInterceptor } from './token-interceptor';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';

describe('TokenInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let token: string;
  let refresh: Subject<boolean>;
  let keycloak: jasmine.SpyObj<KeycloakService>;

  beforeEach(() => {
    token = 'old';
    refresh = new Subject<boolean>();
    keycloak = jasmine.createSpyObj('KeycloakService', ['getToken', 'refreshToken']);
    keycloak.getToken.and.callFake(() => token);
    keycloak.refreshToken.and.callFake(() => refresh.asObservable());

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        { provide: KeycloakService, useValue: keycloak },
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } }
      ]
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Failures surface through expectOne; an unhandled HTTP error would abort the Karma run instead.
  const ignoreErrors = { error: () => undefined };

  const authOf = (url: string) => {
    client.get(url).subscribe(ignoreErrors);
    const req = http.expectOne(url);
    const header = req.request.headers.get('Authorization');
    req.flush({});
    return header;
  };

  const refreshWith = (newToken: string) => {
    token = newToken;
    refresh.next(true);
    refresh.complete();
  };

  describe('which requests get the bearer', () => {
    it('adds it to the eagle-api path', () => {
      expect(authOf('/api/project/1')).toBe('Bearer old');
    });

    it('adds it to the DEMI path', () => {
      expect(authOf('/demi/api/projects?page=1')).toBe('Bearer old');
    });

    it('adds it to DEMI writes', () => {
      client.post('/demi/api/groups', {}).subscribe(ignoreErrors);
      client.put('/demi/api/groups/g1', {}).subscribe(ignoreErrors);
      client.delete('/demi/api/groups/g1').subscribe(ignoreErrors);

      const reqs = http.match(r => r.url.startsWith('/demi/api/groups'));
      expect(reqs.map(r => `${r.request.method} ${r.request.headers.get('Authorization')}`))
        .toEqual(['POST Bearer old', 'PUT Bearer old', 'DELETE Bearer old']);
      reqs.forEach(r => r.flush({}));
    });

    it('adds it to an absolute URL on this origin', () => {
      expect(authOf(`${window.location.origin}/demi/api/projects`)).toBe('Bearer old');
    });

    it('leaves it off a presigned object-store URL', () => {
      expect(authOf('https://objectstore.example.ca/bucket/doc.pdf?X-Amz-Signature=abc')).toBeNull();
    });

    it('leaves it off another host even when the path is /api', () => {
      expect(authOf('https://other.example.ca/api/project')).toBeNull();
    });

    it('leaves it off a same-origin path that only shares a prefix', () => {
      expect(authOf('/apidocs/index.html')).toBeNull();
    });

    it('leaves it off same-origin static files', () => {
      expect(authOf('/admin/assets/i18n/en.json')).toBeNull();
    });
  });

  describe('refresh and retry', () => {
    it('refreshes on 401 and retries with the new token', async () => {
      const result = firstValueFrom(client.get<{ ok: boolean }>('/demi/api/projects'));
      http.expectOne('/demi/api/projects').flush({ error: 'expired' }, { status: 401, statusText: 'Unauthorized' });

      refreshWith('new');
      const retry = http.expectOne('/demi/api/projects');
      expect(retry.request.headers.get('Authorization')).toBe('Bearer new');
      retry.flush({ ok: true });

      expect((await result).ok).toBeTrue();
    });

    it('refreshes on 403 and retries with the new token', async () => {
      const result = firstValueFrom(client.get<{ ok: boolean }>('/api/project'));
      http.expectOne('/api/project').flush({}, { status: 403, statusText: 'Forbidden' });

      refreshWith('new');
      const retry = http.expectOne('/api/project');
      expect(retry.request.headers.get('Authorization')).toBe('Bearer new');
      retry.flush({ ok: true });

      expect((await result).ok).toBeTrue();
    });

    it('passes other errors straight through without a refresh', async () => {
      const result = firstValueFrom(client.get('/api/project'));
      http.expectOne('/api/project').flush({}, { status: 500, statusText: 'Server Error' });

      await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({ status: 500 }));
      expect(keycloak.refreshToken).not.toHaveBeenCalled();
    });

    it('never refreshes for a 401 from another host', async () => {
      const url = 'https://objectstore.example.ca/bucket/doc.pdf';
      const result = firstValueFrom(client.get(url));
      http.expectOne(url).flush({}, { status: 401, statusText: 'Unauthorized' });

      await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({ status: 401 }));
      expect(keycloak.refreshToken).not.toHaveBeenCalled();
    });

    it('runs one refresh for requests that fail together', () => {
      client.get('/api/a').subscribe(ignoreErrors);
      client.get('/demi/api/b').subscribe(ignoreErrors);
      http.expectOne('/api/a').flush({}, { status: 401, statusText: 'Unauthorized' });
      http.expectOne('/demi/api/b').flush({}, { status: 401, statusText: 'Unauthorized' });

      refreshWith('new');

      expect(keycloak.refreshToken).toHaveBeenCalledTimes(1);
      http.expectOne('/api/a').flush({});
      http.expectOne('/demi/api/b').flush({});
    });

    it('hands back the original 401 when the refresh fails', async () => {
      const result = firstValueFrom(client.get('/api/project'));
      http.expectOne('/api/project').flush({}, { status: 401, statusText: 'Unauthorized' });

      refresh.error(undefined);

      await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({ status: 401 }));
    });

    it('tries a fresh refresh after an earlier one failed', () => {
      client.get('/api/first').subscribe(ignoreErrors);
      http.expectOne('/api/first').flush({}, { status: 401, statusText: 'Unauthorized' });
      refresh.error(undefined);

      refresh = new Subject<boolean>();
      client.get('/api/second').subscribe(ignoreErrors);
      http.expectOne('/api/second').flush({}, { status: 401, statusText: 'Unauthorized' });
      refreshWith('new');

      expect(keycloak.refreshToken).toHaveBeenCalledTimes(2);
      http.expectOne('/api/second').flush({});
    });
  });
});
