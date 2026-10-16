import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProjectNotificationsComponent } from './project-notifications.component';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';

describe('ProjectNotificationsComponent', () => {
  let http: HttpTestingController;

  function create(params: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [ProjectNotificationsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: of(params) } },
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error', 'warn', 'info']) }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectNotificationsComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('pages, sorts and searches notifications on DEMI and keys rows on the Eagle id', () => {
    const fixture = create({ currentPage: '2', pageSize: '10', sortBy: '-name', keywords: 'coal' });

    const req = http.expectOne(r => r.url === '/demi/api/notifications');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sort')).toBe('-name');
    expect(req.request.params.get('q')).toBe('coal');
    expect(req.request.params.get('count')).toBe('true');
    req.flush([{ id: 'n1', eagleId: 'n1', name: 'Coal PN', isPublished: true }], { headers: { 'x-total-count': '21' } });

    expect(fixture.componentInstance.tableParams.totalListItems).toBe(21);
    expect(fixture.componentInstance.notificationProjects.map(n => n._id)).toEqual(['n1']);
  });

  for (const field of ['type', 'subType', 'region', 'decision']) {
    for (const [sortBy, sort] of [[`+${field}`, field], [`-${field}`, `-${field}`]]) {
      it(`sorts the ${field} column on DEMI: ${sortBy} sends sort=${sort}`, () => {
        create({ sortBy });

        const req = http.expectOne(r => r.url === '/demi/api/notifications');
        expect(req.request.params.get('sort')).toBe(sort);
        req.flush([]);
      });
    }
  }

  it('lets every column sort', () => {
    const fixture = create({});
    http.expectOne(r => r.url === '/demi/api/notifications').flush([]);

    expect(fixture.componentInstance.documentTableColumns.filter(c => !c.nosort).map(c => c.value))
      .toEqual(['name', 'type', 'subType', 'region', 'decision']);
  });

  it('leaves the sort to DEMI when the table asks for a field DEMI cannot sort', () => {
    create({ sortBy: '+proponent' });

    const req = http.expectOne(r => r.url === '/demi/api/notifications');
    expect(req.request.params.has('sort')).toBeFalse();
    expect(req.request.params.has('q')).toBeFalse();
    req.flush([]);
  });
});
