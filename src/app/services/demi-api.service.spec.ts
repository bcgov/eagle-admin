import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { DemiApiService } from './demi-api.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';

describe('DemiApiService', () => {
  let service: DemiApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    });
    service = TestBed.inject(DemiApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('list', () => {
    it('sends paging, count, sort and keyword under the contract names', () => {
      service.list('projects', { page: 2, pageSize: 25, count: true, sort: '-decisionDate', q: 'mine' }).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/projects');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('25');
      expect(req.request.params.get('count')).toBe('true');
      expect(req.request.params.get('sort')).toBe('-decisionDate');
      expect(req.request.params.get('q')).toBe('mine');
      req.flush([]);
    });

    it('leaves out control parameters the caller did not set', () => {
      service.list('projects').subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/projects');
      expect(req.request.params.keys()).toEqual([]);
      req.flush([]);
    });

    it('sends ids as one comma-separated value', () => {
      service.list('users', { ids: ['a', 'b'] }).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/users');
      expect(req.request.params.getAll('ids')).toEqual(['a,b']);
      req.flush([]);
    });

    it('repeats a filter only when the caller passes an array', () => {
      service.list('comments', { filters: { period: 'cp1', eaoStatus: ['Pending', 'Deferred'] } }).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/comments');
      expect(req.request.params.getAll('period')).toEqual(['cp1']);
      expect(req.request.params.getAll('eaoStatus')).toEqual(['Pending', 'Deferred']);
      req.flush([]);
    });

    it('drops null and undefined filters', () => {
      service.list('comments', { filters: { period: null, project: undefined } }).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/comments');
      expect(req.request.params.keys()).toEqual([]);
      req.flush([]);
    });

    it('returns the body as rows and x-total-count as total', async () => {
      const result = firstValueFrom(service.list<{ id: string }>('projects', { count: true }));
      http.expectOne(r => r.url === '/demi/api/projects')
        .flush([{ id: 'p1' }], { headers: { 'x-total-count': '41' } });

      const page = await result;
      expect(page.rows.map(r => r.id)).toEqual(['p1']);
      expect(page.total).toBe(41);
    });

    it('leaves total undefined when DEMI sends no count header', async () => {
      const result = firstValueFrom(service.list('projects'));
      http.expectOne(r => r.url === '/demi/api/projects').flush([]);

      expect((await result).total).toBeUndefined();
    });

    it('turns a DEMI {error} body into an Error carrying that text', async () => {
      const result = firstValueFrom(service.list('projects', { sort: 'nope' }));
      http.expectOne(r => r.url === '/demi/api/projects')
        .flush({ error: 'sort field not allowed: nope' }, { status: 400, statusText: 'Bad Request' });

      await expectAsync(result).toBeRejectedWithError('sort field not allowed: nope');
    });

    it('falls back to the status line when the error body is not DEMI shaped', async () => {
      const result = firstValueFrom(service.list('projects'));
      http.expectOne(r => r.url === '/demi/api/projects')
        .flush(null, { status: 502, statusText: 'Bad Gateway' });

      await expectAsync(result).toBeRejectedWithError('502 - Bad Gateway');
    });
  });

  describe('get', () => {
    it('reads one row by id, encoding the id into the path', async () => {
      const result = firstValueFrom(service.get<{ id: string }>('documents', 'a/b'));
      http.expectOne('/demi/api/documents/a%2Fb').flush({ id: 'a/b' });

      expect((await result).id).toBe('a/b');
    });

    it('maps a DEMI {error} body the same way as list', async () => {
      const result = firstValueFrom(service.get('documents', 'missing'));
      http.expectOne('/demi/api/documents/missing')
        .flush({ error: 'not found' }, { status: 404, statusText: 'Not Found' });

      await expectAsync(result).toBeRejectedWithError('not found');
    });
  });

  describe('writes', () => {
    it('create posts the body to the kind and answers the saved row', async () => {
      const result = firstValueFrom(service.create<{ id: string }>('organizations', { name: 'Acme' }));
      const req = http.expectOne('/demi/api/organizations');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Acme' });
      req.flush({ id: 'o1' }, { status: 201, statusText: 'Created' });

      expect((await result).id).toBe('o1');
    });

    it('update puts the body to the encoded id', () => {
      service.update('comment-periods', 'a/b', { instructions: 'x' }).subscribe();

      const req = http.expectOne('/demi/api/comment-periods/a%2Fb');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ instructions: 'x' });
      req.flush({});
    });

    it('remove sends DELETE to the id', () => {
      service.remove('updates', 'u1').subscribe();

      expect(http.expectOne('/demi/api/updates/u1').request.method).toBe('DELETE');
    });

    it('action puts to the action under the id, with an empty body by default', () => {
      service.action('notifications', 'n1', 'publish').subscribe();

      const req = http.expectOne('/demi/api/notifications/n1/publish');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush({});
    });

    it('action passes the caller body through', () => {
      service.action('comments', 'c1', 'status', { status: 'Published' }).subscribe();

      expect(http.expectOne('/demi/api/comments/c1/status').request.body).toEqual({ status: 'Published' });
    });

    it('addGroupMembers posts the user ids as members', () => {
      service.addGroupMembers('g1', ['u1', 'u2']).subscribe();

      const req = http.expectOne('/demi/api/groups/g1/members');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ members: ['u1', 'u2'] });
    });

    it('removeGroupMember deletes the member under the group, both ids encoded', () => {
      service.removeGroupMember('g/1', 'u 1').subscribe();

      expect(http.expectOne('/demi/api/groups/g%2F1/members/u%201').request.method).toBe('DELETE');
    });

    it('turns a DEMI {error} body on a write into an Error carrying that text', async () => {
      const result = firstValueFrom(service.update('groups', 'g1', { name: '' }));
      http.expectOne('/demi/api/groups/g1')
        .flush({ error: 'Invalid request body.' }, { status: 400, statusText: 'Bad Request' });

      await expectAsync(result).toBeRejectedWithError('Invalid request body.');
    });
  });

  describe('byIds', () => {
    const idsFrom = (n: number) => Array.from({ length: n }, (_, i) => `id${i}`);

    it('splits more than 100 ids into chunks of at most 100', () => {
      service.byIds('users', idsFrom(250)).subscribe();

      const sizes = http.match(r => r.url === '/demi/api/users')
        .map(req => req.request.params.get('ids').split(',').length);
      expect(sizes).toEqual([100, 100, 50]);
    });

    it('asks for a page as large as the chunk so no row is cut off', () => {
      service.byIds('users', idsFrom(150)).subscribe();

      const pageSizes = http.match(r => r.url === '/demi/api/users').map(req => req.request.params.get('pageSize'));
      expect(pageSizes).toEqual(['100', '50']);
    });

    it('joins the rows of every chunk in request order', async () => {
      const result = firstValueFrom(service.byIds<{ id: string }>('users', idsFrom(101)));
      const [first, second] = http.match(r => r.url === '/demi/api/users');
      second.flush([{ id: 'id100' }]);
      first.flush([{ id: 'id0' }]);

      expect((await result).map(r => r.id)).toEqual(['id0', 'id100']);
    });

    it('sends each id once', () => {
      service.byIds('users', ['a', 'b', 'a']).subscribe();

      expect(http.expectOne(r => r.url === '/demi/api/users').request.params.get('ids')).toBe('a,b');
    });

    it('makes no request for an empty list', async () => {
      expect(await firstValueFrom(service.byIds('users', []))).toEqual([]);
    });
  });
});
