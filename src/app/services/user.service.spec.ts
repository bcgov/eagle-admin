import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { PUBLIC_ORG_NAME, User } from '../models/demi/user';

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
  });

  describe('contact writes', () => {
    it('save PUTs users/<id> without _id and with isPublished true for an EAO contact', () => {
      service.save('u1', nativeUser({ orgName: PUBLIC_ORG_NAME })).subscribe();

      const req = http.expectOne('/demi/api/users/u1');
      expect(req.request.method).toBe('PUT');
      expect('_id' in req.request.body).toBeFalse();
      expect('id' in req.request.body).toBeFalse();
      expect(req.request.body.isPublished).toBeTrue();
      req.flush(nativeUser());
    });

    it('add POSTs users with isPublished false for a contact outside EAO', () => {
      service.add(nativeUser({ orgName: 'Ministry of Forests' })).subscribe();

      const req = http.expectOne('/demi/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.isPublished).toBeFalse();
      req.flush(nativeUser());
    });
  });

  describe('group writes', () => {
    it('addGroup POSTs groups with the DEMI project id and the name', () => {
      service.addGroup('track-42', 'Agencies').subscribe();

      const req = http.expectOne(r => r.method === 'POST' && r.url === '/demi/api/groups');
      expect(req.request.body).toEqual({ projectId: 'track-42', name: 'Agencies' });
      req.flush({});
    });

    it('renameGroup PUTs groups/<id> with only the name', () => {
      service.renameGroup('g1', 'First Nations').subscribe();

      const req = http.expectOne(r => r.method === 'PUT' && r.url === '/demi/api/groups/g1');
      expect(req.request.body).toEqual({ name: 'First Nations' });
      req.flush({});
    });

    it('deleteGroup DELETEs groups/<id>', () => {
      service.deleteGroup('g1').subscribe();

      http.expectOne(r => r.method === 'DELETE' && r.url === '/demi/api/groups/g1').flush({});
    });

    it('removeGroupMember DELETEs groups/<id>/members/<userId>', () => {
      service.removeGroupMember('g1', 'u1').subscribe();

      http.expectOne(r => r.method === 'DELETE' && r.url === '/demi/api/groups/g1/members/u1').flush({});
    });

    it('addGroupMembers sends 150 ids as two bodies', () => {
      const ids = Array.from({ length: 150 }, (_, i) => `u${i}`);
      service.addGroupMembers('g1', ids).subscribe();

      const first = http.expectOne('/demi/api/groups/g1/members');
      expect(first.request.body.members.length).toBe(100);
      first.flush({});
      const second = http.expectOne('/demi/api/groups/g1/members');
      expect(second.request.body.members).toEqual(ids.slice(100));
      second.flush({});
    });
  });
});
