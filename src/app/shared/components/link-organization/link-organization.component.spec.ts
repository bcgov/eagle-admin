import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { LinkOrganizationComponent } from './link-organization.component';
import { OrgService } from 'src/app/services/org.service';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { ConfigService } from 'src/app/services/config.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';

const ROW = { id: 'org1', name: 'Tsawout First Nation', companyType: 'Indigenous Group' };

describe('LinkOrganizationComponent', () => {
  let listOrganizations: jasmine.Spy;

  function create(routeData: object): LinkOrganizationComponent {
    // Keep the Karma page URL untouched when the table utils rewrite the address bar.
    spyOn(window.history, 'replaceState');
    listOrganizations = jasmine.createSpy('listOrganizations').and.returnValue(of({ rows: [ROW], total: 1 }));
    const navigationObject = { backUrl: ['p', 'x'], breadcrumbs: [{ label: 'Project', route: ['p', 'x'] }] };
    TestBed.configureTestingModule({
      imports: [LinkOrganizationComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({}), snapshot: { data: routeData } } },
        { provide: OrgService, useValue: { listOrganizations } },
        { provide: StorageService, useValue: { state: {} } },
        {
          provide: NavigationStackUtils,
          useValue: { getNavigationStack: () => [navigationObject], getLastNavigationObject: () => navigationObject }
        }
      ]
    });
    const fixture = TestBed.createComponent(LinkOrganizationComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('filters on the route companyTypeFilter (pins pick Indigenous Groups)', () => {
    create({ companyTypeFilter: 'Indigenous Group' });

    expect(listOrganizations.calls.mostRecent().args[0].filters.companyType).toBe('Indigenous Group');
  });

  it('hands pickers the Eagle _id, which is the native id', () => {
    const component = create({});

    expect(component.tableData.data[0]._id).toBe('org1');
  });
});

describe('LinkOrganizationComponent sort query', () => {
  let http: HttpTestingController;

  function create(routeParams: object): void {
    spyOn(window.history, 'replaceState');
    const navigationObject = { backUrl: ['p', 'x'], breadcrumbs: [{ label: 'Project', route: ['p', 'x'] }] };
    TestBed.configureTestingModule({
      imports: [LinkOrganizationComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: of(routeParams), snapshot: { data: {} } } },
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) },
        { provide: StorageService, useValue: { state: {} } },
        {
          provide: NavigationStackUtils,
          useValue: { getNavigationStack: () => [navigationObject], getLastNavigationObject: () => navigationObject }
        }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.createComponent(LinkOrganizationComponent).detectChanges();
  }

  afterEach(() => http.verify());

  for (const [sortBy, sort] of [['+companyType', 'companyType'], ['-companyType', '-companyType']]) {
    it(`sends sort=${sort} for ${sortBy}`, () => {
      create({ sortBy });

      const req = http.expectOne(r => r.url === '/demi/api/organizations');
      expect(req.request.urlWithParams).toBe(`/demi/api/organizations?page=1&pageSize=10&count=true&sort=${sort}`);
      req.flush([]);
    });
  }
});
