import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { SearchComponent, demiSort } from './search.component';
import { ApiService } from '../services/api';
import { ConfigService } from '../services/config.service';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';
import { TableTemplateUtils } from '../shared/utils/table-template-utils';

const LISTS = [
  { type: 'label', id: 'ms1', name: 'Application Review', legislation: 2018 },
  { type: 'doctype', id: 'dt1', name: 'Report', legislation: 2018 },
  { type: 'author', id: 'au1', name: 'Proponent', legislation: 2018 },
  { type: 'projectPhase', id: 'ph1', name: 'Pre-Application', legislation: 2018 },
  { type: 'eaDecisions', id: 'ea1', name: 'Certificate Issued', legislation: 2018 },
  { type: 'ceaaInvolvements', id: 'ce1', name: 'Coordinated', legislation: 2018 },
  { type: 'region', id: 'rg1', name: 'Kootenay', legislation: 2018 }
];
const PROPONENT = { id: 'org1', name: 'Teck Coal Limited' };

const DOCUMENT_FILTERS = {
  milestone: 'ms1', type: 'dt1', documentAuthorType: 'au1', projectPhase: 'ph1',
  datePostedStart: '2020-01-01', datePostedEnd: '2020-12-31'
};
const PROJECT_FILTERS = {
  type: 'Mines', eacDecision: 'ea1', region: 'Kootenay', proponent: 'org1', CEAAInvolvement: 'ce1',
  projectPhase: 'ph1', decisionDateStart: '2019-01-01', decisionDateEnd: '2019-12-31'
};

describe('SearchComponent', () => {
  let http: HttpTestingController;
  let component: SearchComponent;
  let toast: jasmine.SpyObj<ToastService>;
  let logger: jasmine.SpyObj<LoggingService>;
  let routeParams$: BehaviorSubject<object>;

  function start(routeParams: object) {
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);
    logger = jasmine.createSpyObj('LoggingService', ['error', 'warn', 'debug']);
    routeParams$ = new BehaviorSubject(routeParams);
    TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: routeParams$ } },
        { provide: ApiService, useValue: { handleError: (e: unknown) => throwError(() => e) } },
        { provide: ConfigService, useValue: { lists: LISTS, getDemiApiPath: () => '/demi/api' } },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: logger }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    // No detectChanges: the load path runs from ngOnInit and needs no rendered template.
    component = TestBed.createComponent(SearchComponent).componentInstance;
    component.ngOnInit();
  }

  function load(routeParams: object) {
    start(routeParams);
    http.expectOne(r => r.url === '/demi/api/organizations').flush([PROPONENT]);
  }

  function expectList(kind: string): TestRequest {
    return http.expectOne(r => r.url === `/demi/api/${kind}`);
  }

  afterEach(() => http.verify());

  it('reads proponents from DEMI organizations by company type', () => {
    start({});

    const req = http.expectOne(r => r.url === '/demi/api/organizations');
    expect(req.request.params.get('companyType')).toBe('Proponent/Certificate Holder');
    expect(req.request.params.get('sort')).toBe('name');
    expect(req.request.params.get('count')).toBe('true');
    req.flush([]);
  });

  it('warns when the proponent picker cannot hold every proponent', () => {
    start({});

    http.expectOne(r => r.url === '/demi/api/organizations').flush([PROPONENT], { headers: { 'x-total-count': '1200' } });

    expect(logger.warn).toHaveBeenCalledWith('Proponent picker shows 1 of 1200', 'SearchComponent');
  });

  it('does not search when the URL holds only a sort', () => {
    load({ sortBy: '+displayName' });

    http.expectNone(r => r.url.startsWith('/demi/api/documents'));
  });

  it('clears the last results when the URL goes back to the landing view', () => {
    load({ keywords: 'water' });
    expectList('documents').flush([{ id: 'd1', projectId: 'p1' }], { headers: { 'x-total-count': '1' } });

    routeParams$.next({ sortBy: '+displayName' });

    expect(component.results).toEqual([]);
    expect(component.count).toBe(0);
    expect(component.ranSearch).toBeFalse();
  });

  it('counts a region-only project search as filtered', () => {
    load({ dataset: 'Project', region: 'Kootenay' });
    expectList('projects').flush([]);

    expect(component.hadFilter).toBeTrue();
  });

  it('drops a page read still in flight when a new search starts', () => {
    load({ keywords: 'water' });
    expectList('documents').flush([], { headers: { 'x-total-count': '60' } });
    component.getPaginatedResults(2);
    const pageRead = expectList('documents');

    routeParams$.next({ dataset: 'Project', keywords: 'coal' });

    expect(pageRead.cancelled).toBeTrue();
    expectList('projects').flush([]);
  });

  it('documents tab sends keyword, paging, sort and every native filter to /documents', () => {
    load({ keywords: 'water', sortBy: '-datePosted', currentPage: '2', pageSize: '10', ...DOCUMENT_FILTERS });

    const p = expectList('documents').request.params;
    expect(p.keys().sort()).toEqual([
      'count', 'datePostedEnd', 'datePostedStart', 'documentAuthorTypeId', 'milestoneId', 'page', 'pageSize',
      'projectPhaseId', 'q', 'sort', 'typeId'
    ]);
    expect(p.get('q')).toBe('water');
    expect(p.get('page')).toBe('2');
    expect(p.get('pageSize')).toBe('10');
    expect(p.get('count')).toBe('true');
    expect(p.get('sort')).toBe('-datePosted');
    expect(p.getAll('milestoneId')).toEqual(['ms1']);
    expect(p.getAll('typeId')).toEqual(['dt1']);
    expect(p.getAll('documentAuthorTypeId')).toEqual(['au1']);
    expect(p.getAll('projectPhaseId')).toEqual(['ph1']);
    expect(p.get('datePostedStart')).toBe('2020-01-01');
    expect(p.get('datePostedEnd')).toBe('2020-12-31');
  });

  it('projects tab sends keyword, sort and every native filter to /projects', () => {
    load({ dataset: 'Project', keywords: 'coal', sortBy: '-name', ...PROJECT_FILTERS });

    const p = expectList('projects').request.params;
    expect(p.keys().sort()).toEqual([
      'CEAAInvolvement', 'count', 'currentPhaseName', 'decisionDateEnd', 'decisionDateStart', 'eacDecision', 'page',
      'pageSize', 'projectType', 'proponentName', 'q', 'region', 'sort'
    ]);
    expect(p.get('q')).toBe('coal');
    expect(p.get('sort')).toBe('-name');
    expect(p.getAll('projectType')).toEqual(['Mines']);
    expect(p.getAll('eacDecision')).toEqual(['ea1']);
    expect(p.getAll('region')).toEqual(['Kootenay']);
    expect(p.getAll('proponentName')).toEqual(['Teck Coal Limited']);
    expect(p.getAll('CEAAInvolvement')).toEqual(['ce1']);
    expect(p.getAll('currentPhaseName')).toEqual(['ph1']);
    expect(p.get('decisionDateStart')).toBe('2019-01-01');
    expect(p.get('decisionDateEnd')).toBe('2019-12-31');
  });

  it('leaves the sort out when DEMI cannot sort on the column', () => {
    load({ keywords: 'water', sortBy: '+type' });

    expect(expectList('documents').request.params.has('sort')).toBeFalse();
  });

  it('leaves out a date that is not ISO', () => {
    load({ keywords: 'water', datePostedStart: 'yesterday' });

    expect(expectList('documents').request.params.has('datePostedStart')).toBeFalse();
  });

  it('caps the page size at what DEMI allows', () => {
    load({ keywords: 'water', pageSize: '5000' });

    expect(expectList('documents').request.params.get('pageSize')).toBe('1000');
  });

  it('asks for no page deeper than DEMI serves', () => {
    load({ keywords: 'water', currentPage: '900', pageSize: '30' });

    expect(expectList('documents').request.params.get('page')).toBe('666');
  });

  it('defaults to 25 rows a page', () => {
    load({ keywords: 'water' });

    expect(expectList('documents').request.params.get('pageSize')).toBe('25');
  });

  it('takes the result count from x-total-count', () => {
    load({ keywords: 'water' });

    expectList('documents').flush(
      [{ id: 'd1', projectId: 'p1', displayName: 'Plan', isPublished: true }],
      { headers: { 'x-total-count': '42' } }
    );

    expect(component.count).toBe(42);
  });

  it('links a document row to its Eagle project id when DEMI has one', () => {
    load({ keywords: 'water' });

    expectList('documents').flush([{ id: 'd1', projectId: 'demi-p1', projectEagleId: 'eagle-p1', displayName: 'Plan' }]);

    expect(component.documentTableData.data[0].projectId).toBe('eagle-p1');
  });

  it('shows an error and no result message when the read fails', () => {
    load({ keywords: 'water' });

    expectList('documents').flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(toast.error).toHaveBeenCalledWith('Search failed. Please try again.');
    expect(logger.error).toHaveBeenCalled();
    expect(component.ranSearch).toBeFalse();
  });

  it('submits a new search from page 1 with the tab and filters in the URL', () => {
    load({ dataset: 'Project', keywords: 'coal', currentPage: '3', ...PROJECT_FILTERS });
    expectList('projects').flush([]);
    const navigate = spyOn(TestBed.inject(Router), 'navigate');

    component.onSubmit();

    const params = navigate.calls.mostRecent().args[0][1];
    expect(params).toEqual(jasmine.objectContaining({ dataset: 'Project', keywords: 'coal', currentPage: 1, ...PROJECT_FILTERS }));
  });

  it('writes the documents filters back to the URL as they were read', () => {
    load({ keywords: 'water', ...DOCUMENT_FILTERS });
    expectList('documents').flush([]);
    const navigate = spyOn(TestBed.inject(Router), 'navigate');

    component.onSubmit();

    expect(navigate.calls.mostRecent().args[0][1]).toEqual(jasmine.objectContaining({ dataset: 'Document', ...DOCUMENT_FILTERS }));
  });

  it('pages with the tab and escaped keywords and filters in the URL', () => {
    load({ dataset: 'Project', keywords: 'a;b', type: 'Energy-Petroleum & Natural Gas' });
    expectList('projects').flush([], { headers: { 'x-total-count': '60' } });
    const updateUrl = spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');

    component.getPaginatedResults(2);
    const req = expectList('projects');
    expect(req.request.params.get('page')).toBe('2');
    req.flush([], { headers: { 'x-total-count': '60' } });

    const [, page, , filters, keywords] = updateUrl.calls.mostRecent().args;
    expect(page).toBe(2);
    expect(filters).toEqual({ dataset: 'Project', type: 'Energy-Petroleum%20%26%20Natural%20Gas' });
    expect(keywords).toBe('a%3Bb');
  });

  it('keeps the shown page and URL when a page read fails', () => {
    load({ keywords: 'water' });
    expectList('documents').flush([{ id: 'd1', projectId: 'p1' }], { headers: { 'x-total-count': '60' } });
    const updateUrl = spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');

    component.getPaginatedResults(2);
    expectList('documents').flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(updateUrl).not.toHaveBeenCalled();
    expect(component.tableParams.currentPage).toBe(1);
    expect(component.count).toBe(60);
  });

  it('drops a page read that a later page click replaced', () => {
    load({ keywords: 'water' });
    expectList('documents').flush([], { headers: { 'x-total-count': '60' } });

    component.getPaginatedResults(2);
    component.getPaginatedResults(3);

    const [first, second] = http.match(r => r.url === '/demi/api/documents');
    expect(first.cancelled).toBeTrue();
    second.flush([]);
  });

  it('pages no deeper than DEMI serves', () => {
    load({ keywords: 'water' });

    expectList('documents').flush([{ id: 'd1', projectId: 'p1' }], { headers: { 'x-total-count': '50000' } });

    expect(component.count).toBe(50000);
    expect(component.tableParams.totalListItems).toBe(20000);
  });
});

describe('demiSort', () => {
  it('maps a table sort to a DEMI sort key', () => {
    expect(demiSort('+displayName', ['displayName'])).toBe('displayName');
    expect(demiSort('-displayName', ['displayName'])).toBe('-displayName');
  });

  it('drops a field outside the allow-list', () => {
    expect(demiSort('+type', ['displayName'])).toBeUndefined();
  });
});
