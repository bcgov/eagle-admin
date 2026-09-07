import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { ConfigService } from '../config.service';
import { LoggingService } from '../logging.service';

describe('AnalyticsService', () => {
  const EAGLE_URL = '/eagle-analytics';

  let service: AnalyticsService;
  let configSignal: any;
  let beaconSpy: jasmine.Spy;
  let fetchSpy: jasmine.Spy;
  let penguinKeyReads: number;

  /** The eagle-analytics client batches; a pagehide flushes the queue through sendBeacon. */
  async function flushedEvents(): Promise<any[]> {
    window.dispatchEvent(new Event('pagehide'));
    if (!beaconSpy.calls.any()) return [];
    const body = beaconSpy.calls.mostRecent().args[1] as Blob;
    return JSON.parse(await body.text()).events;
  }

  /**
   * Config whose retired penguin key counts its own reads, so the specs can prove nothing
   * looks at ANALYTICS_API_URL any more.
   */
  function setConfig(values: Record<string, unknown>): void {
    const config: Record<string, unknown> = { ...values };
    Object.defineProperty(config, 'ANALYTICS_API_URL', {
      enumerable: true,
      get: () => {
        penguinKeyReads++;
        return '/analytics';
      }
    });
    configSignal.set(config);
  }

  beforeEach(() => {
    configSignal = signal({});
    penguinKeyReads = 0;
    beaconSpy = spyOn(navigator, 'sendBeacon').and.returnValue(true);
    fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response('', { status: 202 }));

    const configServiceStub = {};
    Object.defineProperty(configServiceStub, 'config', { value: configSignal });

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: ConfigService, useValue: configServiceStub },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'info', 'warn', 'error']) }
      ]
    });

    service = TestBed.inject(AnalyticsService);
  });

  afterEach(async () => {
    // Drain the queue so the client's leftover flush interval has nothing to post after the spies go.
    await flushedEvents();
  });

  it('sends track and identify to the eagle-analytics client from EAGLE_ANALYTICS_URL', async () => {
    setConfig({ EAGLE_ANALYTICS_URL: EAGLE_URL });
    service.initialize();

    service.identify('user-123', { username: 'jsmith' });
    service.track('Report Generated', { format: 'pdf' });

    const events = await flushedEvents();
    expect(beaconSpy.calls.mostRecent().args[0]).toBe(`${EAGLE_URL}/events`);

    const identified = events.find(e => e.eventType === 'User Identified');
    expect(identified.properties.traits.username).toBe('jsmith');

    const tracked = events.find(e => e.eventType === 'Report Generated');
    expect(tracked.properties.format).toBe('pdf');
    expect(tracked.userId).toBe('user-123');
    expect(tracked.sourceApp).toBe('eagle-admin');
  });

  it('sends page views to the eagle-analytics client', async () => {
    setConfig({ EAGLE_ANALYTICS_URL: EAGLE_URL });
    service.initialize();

    service.identify('user-123');
    service.page('Project Details', { project_id: '123' });

    const events = await flushedEvents();
    expect(beaconSpy.calls.mostRecent().args[0]).toBe(`${EAGLE_URL}/events`);

    const viewed = events.find(e => e.eventType === 'Page Viewed');
    expect(viewed.properties.page_name).toBe('Project Details');
    expect(viewed.properties.project_id).toBe('123');
    expect(viewed.userId).toBe('user-123');
    expect(viewed.sourceApp).toBe('eagle-admin');
  });

  it('resets the eagle-analytics client on logout', async () => {
    setConfig({ EAGLE_ANALYTICS_URL: EAGLE_URL });
    service.initialize();

    service.identify('user-123');
    const beforeReset = await flushedEvents();
    const sessionBefore = beforeReset[0].sessionId;

    service.reset();

    // The client's reset ends the old session and starts a fresh one.
    const events = await flushedEvents();
    expect(events.map(e => e.eventType)).toContain('Session Ended');
    expect(events.map(e => e.eventType)).toContain('Session Started');

    const started = events.find(e => e.eventType === 'Session Started');
    expect(started.sessionId).not.toBe(sessionBefore);
    expect(started.userId).toBeUndefined();
  });

  it('sends nothing anywhere when EAGLE_ANALYTICS_URL is empty', async () => {
    setConfig({ EAGLE_ANALYTICS_URL: '' });
    service.initialize();

    service.identify('user-123');
    service.track('Report Generated');
    service.page('Project Details');
    service.reset();

    expect(await flushedEvents()).toEqual([]);
    // Penguin used to post one fetch per event off ANALYTICS_API_URL; that path is gone.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('never reads the retired ANALYTICS_API_URL config key', async () => {
    setConfig({ EAGLE_ANALYTICS_URL: EAGLE_URL });
    service.initialize();

    service.identify('user-123');
    service.track('Report Generated');
    service.page('Project Details');
    service.reset();
    await flushedEvents();

    expect(penguinKeyReads).toBe(0);
  });
});
