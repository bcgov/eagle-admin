import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { OrgService, orgSort } from './org.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { Org } from '../models/org';
import { Organization } from '../models/demi/organization';

const NATIVE_ORG: Organization = {
  id: '58850f68aaecd9001b808530',
  eagleId: '58850f68aaecd9001b808530',
  name: '445026 BC Limited',
  companyType: 'Proponent/Certificate Holder',
  province: 'British Columbia',
  country: 'Canada',
  address1: '1 Main St',
  city: 'Victoria',
  postal: 'V8V 1A1',
  website: '',
  isPublished: true,
  companyLegal: '445026 BC Limited Ltd.',
  parentCompany: '58850f68aaecd9001b8085aa'
};

describe('OrgService', () => {
  let service: OrgService;
  let http: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: ToastService, useValue: toast }
      ]
    });
    service = TestBed.inject(OrgService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('listOrganizations', () => {
    it('asks DEMI for one company type sorted by name and returns rows with the total', async () => {
      const page = firstValueFrom(service.listOrganizations({
        page: 2, pageSize: 25, count: true, sort: 'name',
        filters: { companyType: ['Indigenous Group'] }
      }));

      const req = http.expectOne(r => r.url === '/demi/api/organizations');
      expect(req.request.params.getAll('companyType')).toEqual(['Indigenous Group']);
      expect(req.request.params.get('sort')).toBe('name');
      expect(req.request.params.get('page')).toBe('2');
      req.flush([NATIVE_ORG], { headers: { 'x-total-count': '296' } });

      const res = await page;
      expect(res.total).toBe(296);
      expect(res.rows[0].id).toBe(NATIVE_ORG.id);
    });

    it('shows an error and yields an empty page when DEMI refuses the query', async () => {
      const page = firstValueFrom(service.listOrganizations({ filters: { companyType: 'x' } }));

      http.expectOne(r => r.url === '/demi/api/organizations')
        .flush({ error: 'parameter given more than once: companyType' }, { status: 400, statusText: 'Bad Request' });

      expect(await page).toEqual({ rows: [], total: 0 });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('getOrganization', () => {
    it('reads one row from DEMI by id', async () => {
      const row = firstValueFrom(service.getOrganization(NATIVE_ORG.id));

      http.expectOne('/demi/api/organizations/58850f68aaecd9001b808530').flush(NATIVE_ORG);

      expect((await row).name).toBe(NATIVE_ORG.name);
    });

    it('passes a missing row on as an error and leaves the toast to the caller', async () => {
      const row = firstValueFrom(service.getOrganization('gone'));

      http.expectOne('/demi/api/organizations/gone')
        .flush({ error: 'Organization not found' }, { status: 404, statusText: 'Not Found' });

      await expectAsync(row).toBeRejectedWithError('Organization not found');
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('orgSort', () => {
    it('keeps a descending name sort', () => {
      expect(orgSort('-name')).toBe('-name');
    });

    it('falls back to name for a column DEMI cannot sort on', () => {
      expect(orgSort('+companyType')).toBe('name');
    });
  });

  describe('writes', () => {
    it('sends an Eagle-shaped body unchanged on save', () => {
      const legacy = new Org({ _id: 'abc123', name: 'Acme', companyType: 'Ministry' });

      service.save(legacy).subscribe();

      const req = http.expectOne('/api/organization/abc123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(legacy);
      req.flush({});
    });

    it('converts a native row to Eagle field names on save', () => {
      service.save(NATIVE_ORG).subscribe();

      const req = http.expectOne('/api/organization/58850f68aaecd9001b808530');
      expect(req.request.body._id).toBe(NATIVE_ORG.id);
      expect(req.request.body.companyLegal).toBe(NATIVE_ORG.companyLegal);
      expect(req.request.body.parentCompany).toBe(NATIVE_ORG.parentCompany);
      expect('eagleId' in req.request.body).toBeFalse();
      req.flush({});
    });

    it('posts a new Eagle-shaped org unchanged on add', () => {
      const created = new Org({ name: 'New Org' });

      service.add(created).subscribe();

      const req = http.expectOne('/api/organization/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(created);
      req.flush({});
    });
  });
});
