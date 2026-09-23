import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivityTableRowsComponent } from './activity-table-rows.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';

describe('ActivityTableRowsComponent', () => {
  let component: ActivityTableRowsComponent;
  let http: HttpTestingController;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toastService = jasmine.createSpyObj('ToastService', ['error']);
    TestBed.configureTestingModule({
      imports: [ActivityTableRowsComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        KeycloakService,
        { provide: ConfigService, useValue: { getApiPath: () => '/api' } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) }
      ]
    });
    // No detectChanges: togglePin needs no rendered rows.
    component = TestBed.createComponent(ActivityTableRowsComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the dateUpdated from the first save with the second toggle', () => {
    const row = { _id: 'a1', pinned: false, dateUpdated: 'd1' };

    component.togglePin(row);
    http.expectOne('/api/recentActivity/a1').flush({ _id: 'a1', pinned: true, dateUpdated: 'd2' });
    component.togglePin(row);

    const second = http.expectOne('/api/recentActivity/a1');
    expect(second.request.body.dateUpdated).toBe('d2');
    second.flush({ _id: 'a1', pinned: false, dateUpdated: 'd3' });
  });

  it('flips the pin back and shows the changed-by-someone-else toast on 409', () => {
    const row = { _id: 'a1', pinned: false, dateUpdated: 'stale' };

    component.togglePin(row);
    http.expectOne('/api/recentActivity/a1').flush(null, { status: 409, statusText: 'Conflict' });

    expect(row.pinned).toBeFalse();
    expect(toastService.error).toHaveBeenCalledWith('This update was changed by someone else. Reload to see the latest.');
  });
});
