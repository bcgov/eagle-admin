import { ApiService } from './api';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';

describe('api', () => {
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
        KeycloakService
      ]
    }).compileComponents();
  });

  it('get reads from the eagle-api path', () => {
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(ApiService).get('project/p1').subscribe();

    expect(http.expectOne('https://test-api.gov.bc.ca/api/project/p1').request.method).toBe('GET');
  });
});
