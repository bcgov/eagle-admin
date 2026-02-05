import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { signal } from '@angular/core';
import { ConfigService } from './config.service';
import { Utils } from 'src/app/shared/utils/utils';
import { KeycloakService } from './keycloak.service';
describe('api', () => {
  let keys = '';
  let schemaName = '';
  let fields = [];
  const pageNum = 1;
  let pageSize = 1;
  let projectLegislation = '';
  let sortBy = '';
  let queryModifier = {};
  let populate = false;
  const filter = {};
  let apiService: ApiService;
  let httpTestingController: HttpTestingController;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      init: jasmine.createSpy('init'),
      config: signal({
        API_PATH: '/api',
        API_LOCATION: 'https://test-api.gov.bc.ca',
        ENVIRONMENT: 'test',
        BANNER_COLOUR: 'red'
      }),
      getApiPath: () => 'https://test-api.gov.bc.ca/api'
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ApiService,
        { provide: ConfigService, useValue: mockConfigService },
        Utils,
        KeycloakService
      ]
    })
      .compileComponents();
  });
  beforeEach(() => {
    httpTestingController = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
  });
  afterEach(() => {
    httpTestingController.verify();
  });
  it('should be a valid url on document search with hashes in query', () => {
    keys = '"Pre-Application","Proponent Comments/Correspondence","Updated Project Description #2 for the Prince Rupert Gas Transmission Project - Northeast to British Columbia to the Prince Rupert Area dated  August 14, 2013"';
    schemaName = 'Document';
    fields = [{ name: 'Project', value: '588511d9aaecd9001b826b33' }];
    pageSize = 10;
    projectLegislation = 'default';
    sortBy = '-datePosted';
    queryModifier = { documentSource: 'PROJECT' };
    populate = true;
    const expectedString = 'https://test-api.gov.bc.ca/api/search?dataset=Document&Project=588511d9aaecd9001b826b33&keywords=%2522Pre-Application%2522%252C%2522Proponent%2520Comments%252FCorrespondence%2522%252C%2522Updated%2520Project%2520Description%2520%25232%2520for%2520the%2520Prince%2520Rupert%2520Gas%2520Transmission%2520Project%2520-%2520Northeast%2520to%2520British%2520Columbia%2520to%2520the%2520Prince%2520Rupert%2520Area%2520dated%2520%2520August%252014%252C%25202013%2522&pageNum=0&pageSize=10&projectLegislation=default&sortBy=-datePosted&populate=true&and%5BdocumentSource%5D=PROJECT';
    apiService.searchKeywords(keys, schemaName, fields, pageNum, pageSize, projectLegislation, sortBy, queryModifier, populate, filter).subscribe();
    const req = httpTestingController.expectOne(expectedString);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
