import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { OrgService } from './org.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
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

  describe('writes', () => {
    it('saves to the DEMI row with only the fields DEMI lets a PUT set', () => {
      service.save(NATIVE_ORG).subscribe();

      const req = http.expectOne('/demi/api/organizations/58850f68aaecd9001b808530');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        name: NATIVE_ORG.name,
        companyType: NATIVE_ORG.companyType,
        province: NATIVE_ORG.province,
        country: NATIVE_ORG.country,
        address1: NATIVE_ORG.address1,
        city: NATIVE_ORG.city,
        postal: NATIVE_ORG.postal,
        companyLegal: NATIVE_ORG.companyLegal,
        parentCompany: NATIVE_ORG.parentCompany
      });
      req.flush(NATIVE_ORG);
    });

    it('creates a published organization, as eagle-api did', () => {
      service.add({ name: 'New Org', companyType: 'Ministry' }).subscribe();

      const req = http.expectOne('/demi/api/organizations');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'New Org', companyType: 'Ministry', isPublished: true });
      req.flush({ ...NATIVE_ORG, name: 'New Org' });
    });

    it('shows DEMI\'s message and yields nothing when a save is refused', async () => {
      const saved = firstValueFrom(service.save(NATIVE_ORG), { defaultValue: null });

      http.expectOne('/demi/api/organizations/58850f68aaecd9001b808530')
        .flush({ error: 'Invalid request body.', fields: { website: 'is not a writable field' } },
          { status: 400, statusText: 'Bad Request' });

      expect(await saved).toBeNull();
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to save organization. Invalid request body. website: is not a writable field');
    });
  });
});
