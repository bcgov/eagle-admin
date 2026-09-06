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

  /** The eagle-analytics client batches; a pagehide flushes the queue through sendBeacon. */
  async function flushedEvents(): Promise<any[]> {
    window.dispatchEvent(new Event('pagehide'));
    if (!beaconSpy.calls.any()) return [];
    const body = beaconSpy.calls.mostRecent().args[1] as Blob;
    return JSON.parse(await body.text()).events;
  }

  /** Penguin posts one fetch per event, but analytics.io dispatches them off its own queue. */
  async function penguinPosts(expected: number): Promise<any[]> {
    for (let attempt = 0; attempt < 50 && fetchSpy.calls.count() < expected; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return fetchSpy.calls.allArgs().map(([, init]) => JSON.parse(init.body));
  }

  beforeEach(() => {
    configSignal = signal({});
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

  it('fans track and identify out to both penguin and the eagle-analytics client', async () => {
    configSignal.set({ ANALYTICS_API_URL: '/analytics', EAGLE_ANALYTICS_URL: EAGLE_URL });
    service.initialize();

    service.identify('user-123', { username: 'jsmith' });
    service.track('Report Generated', { format: 'pdf' });

    expect((await penguinPosts(2)).map(p => p.eventType))
      .toEqual(['User Identified', 'Report Generated']);

    const events = await flushedEvents();
    expect(beaconSpy.calls.mostRecent().args[0]).toBe(`${EAGLE_URL}/events`);

    const identified = events.find(e => e.eventType === 'User Identified');
    expect(identified.properties.traits.username).toBe('jsmith');

    const tracked = events.find(e => e.eventType === 'Report Generated');
    expect(tracked.properties.format).toBe('pdf');
    expect(tracked.userId).toBe('user-123');
    expect(tracked.sourceApp).toBe('eagle-admin');
  });

  it('leaves penguin tracking alone when EAGLE_ANALYTICS_URL is empty', async () => {
    configSignal.set({ ANALYTICS_API_URL: '/analytics', EAGLE_ANALYTICS_URL: '' });
    service.initialize();

    service.identify('user-123');
    service.track('Report Generated');

    expect((await penguinPosts(2)).map(p => p.eventType))
      .toEqual(['User Identified', 'Report Generated']);
    expect(await flushedEvents()).toEqual([]);
  });
});
