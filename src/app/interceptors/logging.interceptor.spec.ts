import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { LoggingService } from '../services/logging.service';
import { SKIP_ERROR_LOG, loggingInterceptor } from './logging.interceptor';

describe('loggingInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let logger: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    logger = jasmine.createSpyObj<LoggingService>('LoggingService', ['logHttpRequest', 'logHttpResponse', 'logHttpError']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loggingInterceptor])),
        provideHttpClientTesting(),
        { provide: LoggingService, useValue: logger }
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('logs a failed request as an HTTP error', async () => {
    const result = firstValueFrom(http.get('/api/project'));
    backend.expectOne('/api/project').flush({}, { status: 500, statusText: 'Server Error' });

    await expectAsync(result).toBeRejectedWith(jasmine.any(HttpErrorResponse));
    expect(logger.logHttpError).toHaveBeenCalledOnceWith('GET', '/api/project', jasmine.any(HttpErrorResponse));
  });

  it('skips the error log but still fails the request when SKIP_ERROR_LOG is set', async () => {
    const context = new HttpContext().set(SKIP_ERROR_LOG, true);
    const result = firstValueFrom(http.post('/api/eao-analytics', {}, { context }));
    backend.expectOne('/api/eao-analytics').flush({}, { status: 400, statusText: 'Bad Request' });

    await expectAsync(result).toBeRejectedWith(jasmine.any(HttpErrorResponse));
    expect(logger.logHttpError).not.toHaveBeenCalled();
  });
});
