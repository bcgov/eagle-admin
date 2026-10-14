import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { User as LegacyUser } from '../models/user';
import { User } from '../models/demi/user';

function nativeUser(overrides: Partial<User> = {}): User {
  return {
    id: '5c9e2b1f8a0c3d0019a1b2c3', firstName: 'Ada', middleName: null, lastName: 'Lee', displayName: 'Ada Lee',
    salutation: '', title: 'Planner', department: '', org: '58850ff6aaecd9001b8094a1', orgName: 'EAO',
    email: 'ada@example.com', phoneNumber: '250-555-0100', cellPhoneNumber: '', faxNumber: '',
    address1: '1 Main St', address2: '', city: 'Victoria', province: 'British Columbia', country: 'Canada',
    postalCode: 'V8W 1A1', notes: '', ...overrides
  };
}

describe('UserService', () => {
  let service: UserService;
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
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('reads', () => {
    it('lists contacts from DEMI with keyword, paging, count and the name sort', async () => {
      const result = firstValueFrom(service.listUsers({ q: 'ada', page: 2, pageSize: 25, sort: '-displayName' }));

      const req = http.expectOne(r => r.url === '/demi/api/users');
      expect(req.request.params.get('q')).toBe('ada');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('25');
      expect(req.request.params.get('count')).toBe('true');
      expect(req.request.params.get('sort')).toBe('-displayName');
      req.flush([nativeUser()], { headers: { 'x-total-count': '41' } });

      expect((await result).total).toBe(41);
    });

    it('sends no q when the keyword box is empty', () => {
      service.listUsers({ q: '', page: 1, pageSize: 10, sort: 'displayName' }).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/users');
      expect(req.request.params.has('q')).toBeFalse();
      req.flush([]);
    });

    it('reads one contact by id', () => {
      service.getUser('u1').subscribe();

      http.expectOne('/demi/api/users/u1').flush(nativeUser());
    });

    it('reads group members with one ids request', () => {
      service.getUsersByIds(['u1', 'u2']).subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/users');
      expect(req.request.params.get('ids')).toBe('u1,u2');
      req.flush([]);
    });

    it('reads one group by id', () => {
      service.getGroup('g1').subscribe();

      http.expectOne('/demi/api/groups/g1').flush({ id: 'g1', name: 'Agencies', members: [] });
    });

    it('lists a project\'s groups by DEMI project id, sorted by name', () => {
      service.listProjectGroups('track-42', 1, 25, 'name').subscribe();

      const req = http.expectOne(r => r.url === '/demi/api/groups');
      expect(req.request.params.get('project')).toBe('track-42');
      expect(req.request.params.get('sort')).toBe('name');
      expect(req.request.params.get('count')).toBe('true');
      req.flush([]);
    });

    it('resolves the DEMI project id from the Eagle project id', async () => {
      const id = firstValueFrom(service.getDemiProjectId('5885109faaecd9001b81314c'));

      http.expectOne('/demi/api/projects/5885109faaecd9001b81314c')
        .flush({ id: 'track-42', eagleId: '5885109faaecd9001b81314c' });

      expect(await id).toBe('track-42');
    });
  });

  describe('save', () => {
    it('sends a legacy contact unchanged to user/<_id>', () => {
      const legacy = new LegacyUser({ _id: 'e1', firstName: 'Ada', lastName: 'Lee' });
      service.save(legacy).subscribe();

      const req = http.expectOne('/api/user/e1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(legacy);
      req.flush({});
    });

    it('sends a native contact to user/<id> with the id as _id', () => {
      service.save(nativeUser({ id: 'e2' })).subscribe();

      const req = http.expectOne('/api/user/e2');
      expect(req.request.body._id).toBe('e2');
      expect(req.request.body.orgName).toBe('EAO');
      req.flush({});
    });

    it('drops the native id from the eagle-api body', () => {
      service.save(nativeUser({ id: 'e2' })).subscribe();

      const req = http.expectOne('/api/user/e2');
      expect('id' in req.request.body).toBeFalse();
      req.flush({});
    });
  });

  describe('add', () => {
    it('posts a new contact without an id unchanged', () => {
      const fresh = new LegacyUser({ firstName: 'Ada', lastName: 'Lee' });
      service.add(fresh).subscribe();

      const req = http.expectOne('/api/user/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(fresh);
      req.flush({});
    });
  });
});
