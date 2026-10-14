import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ReviewCommentsTabComponent } from './review-comments-tab.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';

const PERIOD_ID = '598b6eb61ecbc9001dfeba55';

describe('ReviewCommentsTabComponent', () => {
  let http: HttpTestingController;

  function create(params: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [ReviewCommentsTabComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: of({ commentPeriodId: PERIOD_ID, ...params }) } },
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: DocumentService, useValue: {} },
        // The real one rewrites the browser URL.
        {
          provide: TableTemplateUtils, useValue: {
            getParamsFromUrl: (p: Record<string, string>) => new TableParamsObject(+(p.pageSize ?? 10), +(p.currentPage ?? 1), 0, p.sortBy ?? ''),
            updateUrl: () => undefined
          }
        }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ReviewCommentsTabComponent);
    fixture.componentRef.setInput('project', { _id: '588511d0aaecd9001b826192' });
    fixture.detectChanges();
    return fixture;
  }

  function listRequest(): TestRequest {
    return http.expectOne(req => req.url === '/demi/api/comments');
  }

  afterEach(() => http.verify());

  it('lists the period\'s comments with one eaoStatus param per toggled filter', () => {
    create({ pending: 'true', rejected: 'true', currentPage: '2', pageSize: '25', sortBy: '+dateAdded' });

    const { params } = listRequest().request;
    expect(params.get('period')).toBe(PERIOD_ID);
    expect(params.getAll('eaoStatus')).toEqual(['Pending', 'Rejected']);
    expect(params.get('page')).toBe('2');
    expect(params.get('pageSize')).toBe('25');
    expect(params.get('sort')).toBe('dateAdded');
    expect(params.get('count')).toBe('true');
  });

  it('sends no status filter when no filter is toggled', () => {
    create({});

    expect(listRequest().request.params.has('eaoStatus')).toBeFalse();
  });

  it('falls back to newest first for a sort DEMI does not allow', () => {
    create({ sortBy: '-commentId' });

    expect(listRequest().request.params.get('sort')).toBe('-dateAdded');
  });

  it('shows the total from x-total-count and links rows by comment id', () => {
    const fixture = create({});

    listRequest().flush(
      [{ id: '59a0593a6356080019383e16', periodId: PERIOD_ID, commentId: 12, documents: ['d1'], eaoStatus: 'Pending' }],
      { headers: { 'x-total-count': '31' } }
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.tableParams.totalListItems).toBe(31);
    expect(fixture.componentInstance.commentTableData.data[0]).toEqual(jasmine.objectContaining({
      _id: '59a0593a6356080019383e16', period: PERIOD_ID, attachments: 1
    }));
  });
});
