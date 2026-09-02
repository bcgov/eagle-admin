import { TestBed } from '@angular/core/testing';
import { LoggingService } from './logging.service';
import { TelemetryService } from './telemetry.service';

describe('LoggingService', () => {
  let service: LoggingService;
  let telemetry: jasmine.SpyObj<TelemetryService>;

  beforeEach(() => {
    telemetry = jasmine.createSpyObj('TelemetryService', ['trackException']);
    TestBed.configureTestingModule({
      providers: [LoggingService, { provide: TelemetryService, useValue: telemetry }]
    });
    service = TestBed.inject(LoggingService);
    spyOn(console, 'error');
  });

  it('reports errors to telemetry', () => {
    service.error('Unhandled Error: boom', 'GlobalErrorHandler');

    const [error, properties] = telemetry.trackException.calls.mostRecent().args;
    expect((error as Error).message).toBe('Unhandled Error: boom');
    expect(properties).toEqual({ source: 'GlobalErrorHandler' });
  });

  it('passes the original Error through instead of re-wrapping it', () => {
    const original = new Error('original');

    service.error('wrapper text', 'Test', original);

    expect(telemetry.trackException.calls.mostRecent().args[0]).toBe(original);
  });

  it('reports a failed HTTP call', () => {
    service.logHttpError('GET', '/api/projects', { status: 401, message: 'Unauthorized' });

    const [error] = telemetry.trackException.calls.mostRecent().args;
    expect((error as Error).message).toContain('/api/projects');
    expect(telemetry.trackException).toHaveBeenCalledTimes(1);
  });

  it('does not report non-error logs', () => {
    service.warn('just a warning');
    service.info('just info');
    service.debug('just debug');
    service.logHttpResponse('GET', '/api/projects', 200);

    expect(telemetry.trackException).not.toHaveBeenCalled();
  });
});
