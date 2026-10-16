import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProjectListComponent } from './project-list.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';

const LISTS = [
  { id: 'r-peace', name: 'Peace', type: 'region', legislation: 0, listOrder: 1 },
  { id: 'r-skeena', name: 'Skeena', type: 'region', legislation: 0, listOrder: 2 },
  { id: 'd-cert', name: 'Certificate Issued', type: 'eaDecisions', legislation: 2018, listOrder: 1 },
  { id: 'ph-early', name: 'Early Engagement', type: 'projectPhase', legislation: 2018, listOrder: 1 },
  { id: 'c-none', name: 'None', type: 'ceaaInvolvements', legislation: 2002, listOrder: 1 }
];

const PROPONENTS = [
  { id: 'org-1', name: 'North Coast Mining Ltd.' },
  { id: 'org-2', name: 'Peace Power Corp.' }
];

describe('ProjectListComponent', () => {
  let http: HttpTestingController;

  function init(params: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { params: of(params) } },
        { provide: ConfigService, useValue: { lists: LISTS, getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectListComponent);
    fixture.componentInstance.ngOnInit();
    return fixture.componentInstance;
  }

  function start(params: Record<string, string>) {
    const component = init(params);
    http.expectOne(r => r.url === '/demi/api/organizations').flush(PROPONENTS);
    return component;
  }

  function projectsRequest(): TestRequest {
    return http.expectOne(r => r.url === '/demi/api/projects');
  }

  afterEach(() => http.verify());

  it('loads proponent picker options from DEMI organizations by company type', () => {
    init({});

    const req = http.expectOne(r => r.url === '/demi/api/organizations');
    expect(req.request.params.get('companyType')).toBe('Proponent/Certificate Holder');
    expect(req.request.params.get('sort')).toBe('name');
    req.flush(PROPONENTS);
    projectsRequest().flush([]);
  });

  it('sends each filter under its DEMI name', () => {
    start({
      type: 'Mines',
      region: 'Peace',
      proponent: 'org-1',
      eacDecision: 'd-cert',
      projectPhase: 'ph-early',
      CEAAInvolvement: 'c-none',
      decisionDateStart: '2020-01-01',
      decisionDateEnd: '2020-12-31'
    });

    const params = projectsRequest().request.params;
    expect(params.getAll('projectType')).toEqual(['Mines']);
    expect(params.getAll('region')).toEqual(['Peace']);
    expect(params.getAll('proponentName')).toEqual(['North Coast Mining Ltd.']);
    expect(params.getAll('eacDecision')).toEqual(['d-cert']);
    expect(params.getAll('currentPhaseName')).toEqual(['ph-early']);
    expect(params.getAll('CEAAInvolvement')).toEqual(['c-none']);
    expect(params.get('decisionDateStart')).toBe('2020-01-01');
    expect(params.get('decisionDateEnd')).toBe('2020-12-31');
    expect(params.has('projectPhase')).toBeFalse();
    expect(params.has('proponent')).toBeFalse();
    expect(params.has('type')).toBeFalse();
  });

  it('repeats a filter once per picked value', () => {
    start({ region: 'Peace,Skeena', proponent: 'org-1,org-2' });

    const params = projectsRequest().request.params;
    expect(params.getAll('region')).toEqual(['Peace', 'Skeena']);
    expect(params.getAll('proponentName')).toEqual(['North Coast Mining Ltd.', 'Peace Power Corp.']);
  });

  it('repeats pcp once per picked comment period state', () => {
    start({ pcp: 'open,pending' });

    expect(projectsRequest().request.params.getAll('pcp')).toEqual(['open', 'pending']);
  });

  it('drops a pcp value DEMI does not know, and the valued component filter', () => {
    start({ pcp: 'soon', vc: 'vc-1' });

    const params = projectsRequest().request.params;
    expect(params.has('pcp')).toBeFalse();
    expect(params.has('vc')).toBeFalse();
  });

  it('puts picked comment period states in the URL on submit', () => {
    const component = start({});
    projectsRequest().flush([]);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.filterForUI.pcp = [{ code: 'open', name: 'Open' }, { code: 'closed', name: 'Closed' }];

    component.onSubmit();

    expect(navigate.calls.mostRecent().args[0][1].pcp).toBe('open,closed');
  });

  it('sends the sort and each pcp value as DEMI query parameters', () => {
    start({ sortBy: '-eacDecisionSort', pcp: 'open,upcoming', pageSize: '25' });

    expect(projectsRequest().request.urlWithParams)
      .toBe('/demi/api/projects?page=1&pageSize=25&count=true&sort=-eacDecisionSort&pcp=open&pcp=upcoming');
  });

  it('asks for the total and pages from 1', () => {
    start({ currentPage: '3', pageSize: '25' });

    const params = projectsRequest().request.params;
    expect(params.get('count')).toBe('true');
    expect(params.get('page')).toBe('3');
    expect(params.get('pageSize')).toBe('25');
  });

  it('sorts by name descending when the URL asks for it', () => {
    start({ sortBy: '-name' });

    expect(projectsRequest().request.params.get('sort')).toBe('-name');
  });

  it('sorts by phase name', () => {
    start({ sortBy: '+currentPhaseName.name' });

    expect(projectsRequest().request.params.get('sort')).toBe('currentPhaseName.name');
  });

  it('sorts by EA decision through its sort field', () => {
    start({ sortBy: '-eacDecisionSort' });

    expect(projectsRequest().request.params.get('sort')).toBe('-eacDecisionSort');
  });

  it('falls back to name for a sort DEMI does not offer', () => {
    start({ sortBy: '+proponent.name' });

    expect(projectsRequest().request.params.get('sort')).toBe('name');
  });

  it('lets every column sort, each by its DEMI sort key', () => {
    const component = start({});
    projectsRequest().flush([]);

    expect(component.projectTableColumns.filter(c => !c.nosort).map(c => c.value))
      .toEqual(['name', 'proponentName', 'projectType', 'region', 'currentPhaseName.name', 'eacDecisionSort']);
  });

  it('shows rows with the legacy fields the table reads and the total from DEMI', () => {
    const component = start({});
    projectsRequest().flush(
      [
        {
          id: 'track-1', eagleId: 'eagle-1', name: 'Red Chris', projectType: 'Mines', region: 'Skeena',
          proponentName: 'North Coast Mining Ltd.', currentPhaseName: { _id: 'ph-early', name: 'Early Engagement' },
          eacDecision: { _id: 'd-cert', name: 'Certificate Issued' }
        },
        { id: 'track-2', eagleId: null, name: 'Track Only' }
      ],
      { headers: { 'x-total-count': '42' } }
    );

    const rows = component.projectTableData.data;
    expect(component.tableParams.totalListItems).toBe(42);
    expect(rows[0]._id).toBe('eagle-1');
    expect(rows[0].type).toBe('Mines');
    expect(rows[0].proponent.name).toBe('North Coast Mining Ltd.');
    expect(rows[0].currentPhaseName.name).toBe('Early Engagement');
    expect(rows[1]._id).toBe('track-2');
  });
});
