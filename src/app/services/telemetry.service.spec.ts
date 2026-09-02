import { TestBed } from '@angular/core/testing';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let loadSdk: jasmine.Spy;
  let appInsights: { loadAppInsights: jasmine.Spy; addTelemetryInitializer: jasmine.Spy; trackException: jasmine.Spy };
  let initializer: (item: any) => boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TelemetryService] });
    service = TestBed.inject(TelemetryService);

    appInsights = {
      loadAppInsights: jasmine.createSpy('loadAppInsights'),
      addTelemetryInitializer: jasmine.createSpy('addTelemetryInitializer').and.callFake((fn: any) => (initializer = fn)),
      trackException: jasmine.createSpy('trackException')
    };
    loadSdk = spyOn<any>(service, 'loadSdk').and.returnValue(
      Promise.resolve({ ApplicationInsights: function () { return appInsights; } })
    );
  });

  it('does not load the SDK when no connection string is configured', async () => {
    await service.init('', 'eagle-admin', ['localhost']);
    await service.init(undefined, 'eagle-admin', ['localhost']);

    expect(loadSdk).not.toHaveBeenCalled();
  });

  it('does nothing when trackException is called before init', () => {
    service.trackException(new Error('too early'));

    expect(appInsights.trackException).not.toHaveBeenCalled();
  });

  it('loads the SDK and registers an initializer when configured', async () => {
    await service.init('InstrumentationKey=abc', 'eagle-admin', ['localhost']);

    expect(appInsights.loadAppInsights).toHaveBeenCalled();
    expect(appInsights.addTelemetryInitializer).toHaveBeenCalled();
  });

  it('buffers early exceptions and flushes them once init completes', async () => {
    service.trackException(new Error('early'));

    await service.init('InstrumentationKey=x', 'eagle-admin', []);

    expect(appInsights.trackException).toHaveBeenCalledTimes(1);
    const [envelope] = appInsights.trackException.calls.mostRecent().args;
    expect(envelope.exception.message).toBe('early');
  });

  it('drops early exceptions past the buffer limit', async () => {
    for (let i = 0; i < 21; i++) service.trackException(new Error(`early-${i}`));

    await service.init('InstrumentationKey=x', 'eagle-admin', []);

    expect(appInsights.trackException).toHaveBeenCalledTimes(20);
  });

  it('resolves and stays off when the lazy SDK chunk fails to load', async () => {
    loadSdk.and.returnValue(Promise.reject(new Error('stale chunk 404')));

    await expectAsync(service.init('InstrumentationKey=abc', 'eagle-admin', ['localhost'])).toBeResolved();

    expect(() => service.trackException(new Error('after failed init'))).not.toThrow();
    expect(appInsights.trackException).not.toHaveBeenCalled();
  });

  it('wraps a non-Error value before tracking it', async () => {
    await service.init('InstrumentationKey=abc', 'eagle-admin', ['localhost']);
    service.trackException('boom', { source: 'Test' });

    const [envelope, properties] = appInsights.trackException.calls.mostRecent().args;
    expect(envelope.exception instanceof Error).toBe(true);
    expect(envelope.exception.message).toBe('boom');
    expect(properties).toEqual({ source: 'Test' });
  });

  describe('telemetry initializer', () => {
    beforeEach(async () => {
      await service.init('InstrumentationKey=abc', 'eagle-admin', ['localhost']);
    });

    it('drops a successful dependency and keeps a failed one', () => {
      const succeeded = { baseType: 'RemoteDependencyData', baseData: { success: true, name: 'GET /api/projects' } };
      const failed = { baseType: 'RemoteDependencyData', baseData: { success: false, name: 'GET /api/projects' } };

      expect(initializer(succeeded)).toBe(false);
      expect(initializer(failed)).toBe(true);
    });

    it('keeps telemetry that is not a dependency', () => {
      expect(initializer({ baseType: 'ExceptionData', baseData: { exceptions: [] } })).toBe(true);
    });

    it('strips query strings from dependency and exception fields', () => {
      const failed = {
        baseType: 'RemoteDependencyData',
        baseData: {
          success: false,
          uri: 'https://eagle-dev.example.com/api/projects?token=abc',
          target: 'eagle-dev.example.com?token=abc',
          name: 'GET /api/projects?token=abc'
        }
      };
      const exception = {
        baseType: 'ExceptionData',
        baseData: {
          message: 'HTTP GET /api/x?q=a 500 tail',
          exceptions: [{ message: 'HTTP GET /api/projects?token=abc 401' }]
        }
      };

      initializer(failed);
      initializer(exception);

      expect(failed.baseData.uri).toBe('https://eagle-dev.example.com/api/projects');
      expect(failed.baseData.target).toBe('eagle-dev.example.com');
      expect(failed.baseData.name).toBe('GET /api/projects');
      expect(exception.baseData.message).toBe('HTTP GET /api/x 500 tail');
      expect(exception.baseData.exceptions[0].message).toBe('HTTP GET /api/projects 401');
    });

    it('strips query tokens from a multi-line exception stack', () => {
      const exception = {
        baseType: 'ExceptionData',
        baseData: {
          exceptions: [{
            message: 'HTTP GET /api/projects?token=SECRET 401',
            stack: 'Error: HTTP GET /api/projects?token=SECRET 401\n    at x (http://h/app.js?v=1:1:1)'
          }]
        }
      };

      initializer(exception);

      const stack = exception.baseData.exceptions[0].stack;
      expect(stack).not.toContain('token=SECRET');
      expect(stack).not.toContain('?v=1');
      expect(stack).toContain('/api/projects');
      expect(stack).toContain('401');
    });

    it('strips query strings from parsedStack fileName and assembly', () => {
      const exception = {
        baseType: 'ExceptionData',
        baseData: {
          exceptions: [{
            parsedStack: [{
              fileName: 'http://h/app.js?v=1',
              assembly: 'at fn (http://h/app.js?v=1:1:1)',
              method: 'fn',
              line: 1
            }]
          }]
        }
      };

      initializer(exception);

      const frame = exception.baseData.exceptions[0].parsedStack[0];
      expect(frame.fileName).toBe('http://h/app.js');
      expect(frame.assembly).toBe('at fn (http://h/app.js:1:1)');
    });

    it('tags every item with the cloud role', () => {
      const item: any = { baseType: 'ExceptionData', baseData: {} };

      initializer(item);

      expect(item.tags['ai.cloud.role']).toBe('eagle-admin');
    });
  });
});
