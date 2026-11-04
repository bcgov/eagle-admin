import { ApiService } from './api';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ConfigService } from './config.service';

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
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compileComponents();
  });

  it('get reads from the eagle-api path', () => {
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(ApiService).get('project/p1').subscribe();

    expect(http.expectOne('https://test-api.gov.bc.ca/api/project/p1').request.method).toBe('GET');
  });

  it('handleError keeps the HTTP status on the thrown error', async () => {
    const response = new HttpErrorResponse({ status: 409, statusText: 'Conflict', error: { message: 'Stale version' } });

    const thrown = await firstValueFrom(TestBed.inject(ApiService).handleError(response)).catch((e) => e);

    expect(thrown.message).toBe('Stale version');
    expect(thrown.status).toBe(409);
  });
});
