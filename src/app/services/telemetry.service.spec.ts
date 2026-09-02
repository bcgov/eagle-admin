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
          message: 'HTTP GET /api/projects?token=abc 401',
          exceptions: [{ message: 'HTTP GET /api/projects?token=abc 401' }]
        }
      };

      initializer(failed);
      initializer(exception);

      expect(failed.baseData.uri).toBe('https://eagle-dev.example.com/api/projects');
      expect(failed.baseData.target).toBe('eagle-dev.example.com');
      expect(failed.baseData.name).toBe('GET /api/projects');
      expect(exception.baseData.message).toBe('HTTP GET /api/projects');
      expect(exception.baseData.exceptions[0].message).toBe('HTTP GET /api/projects');
    });

    it('tags every item with the cloud role', () => {
      const item: any = { baseType: 'ExceptionData', baseData: {} };

      initializer(item);

      expect(item.tags['ai.cloud.role']).toBe('eagle-admin');
    });
  });
});
