import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrganizationsComponent } from './organizations.component';
import { OrgService } from '../services/org.service';
import { StorageService } from '../services/storage.service';
import { DemiListParams } from '../models/demi/demi-list';
import { ConfigService } from '../services/config.service';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';

const ROW = { id: 'org1', name: 'Acme Mining', companyType: 'Proponent/Certificate Holder', companyLegal: 'Acme Mining Ltd.' };

describe('OrganizationsComponent', () => {
  let fixture: ComponentFixture<OrganizationsComponent>;
  let listOrganizations: jasmine.Spy;

  function create(routeParams: object): void {
    // Keep the Karma page URL untouched when the table utils rewrite the address bar.
    spyOn(window.history, 'replaceState');
    listOrganizations = jasmine.createSpy('listOrganizations').and.returnValue(of({ rows: [ROW], total: 41 }));
    TestBed.configureTestingModule({
      imports: [OrganizationsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
        { provide: OrgService, useValue: { listOrganizations } },
        { provide: StorageService, useValue: { state: {} } }
      ]
    });
    fixture = TestBed.createComponent(OrganizationsComponent);
    fixture.detectChanges();
  }

  function sentParams(): DemiListParams {
    return listOrganizations.calls.mostRecent().args[0];
  }

  it('sends the checked organization types as DEMI companyType values', () => {
    create({ companyType: 'proponent,ministry' });

    expect(sentParams().filters.companyType).toEqual(['Proponent/Certificate Holder', 'Ministry']);
  });

  it('sends no companyType when no type is checked', () => {
    create({});

    expect(sentParams().filters.companyType).toBeUndefined();
  });

  it('sorts on name when the URL carries a column DEMI cannot sort on', () => {
    create({ sortBy: '+description', keywords: 'acme' });

    expect(sentParams().sort).toBe('name');
    expect(sentParams().q).toBe('acme');
  });

  it('shows the native rows and the total from DEMI', () => {
    create({});

    expect(fixture.nativeElement.querySelector('td[data-label="Name"]').textContent).toContain('Acme Mining');
    expect(fixture.componentInstance.tableParams.totalListItems).toBe(41);
  });

  it('renders every column but Action as a sort button', () => {
    create({});

    const sortable = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead th'))
      .filter(th => th.querySelector('button'))
      .map(th => th.textContent.trim());
    expect(sortable).toEqual(['Name', 'Organization Type', 'Company Legal']);
  });
});

describe('OrganizationsComponent sort query', () => {
  let http: HttpTestingController;

  function create(routeParams: object): void {
    spyOn(window.history, 'replaceState');
    TestBed.configureTestingModule({
      imports: [OrganizationsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) },
        { provide: StorageService, useValue: { state: {} } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.createComponent(OrganizationsComponent).detectChanges();
  }

  afterEach(() => http.verify());

  for (const [sortBy, sort] of [
    ['+companyType', 'companyType'], ['-companyType', '-companyType'],
    ['+companyLegal', 'companyLegal'], ['-companyLegal', '-companyLegal']
  ]) {
    it(`sends sort=${sort} for ${sortBy}`, () => {
      create({ sortBy });

      const req = http.expectOne(r => r.url === '/demi/api/organizations');
      expect(req.request.urlWithParams).toBe(`/demi/api/organizations?page=1&pageSize=10&count=true&sort=${sort}`);
      req.flush([]);
    });
  }
});
