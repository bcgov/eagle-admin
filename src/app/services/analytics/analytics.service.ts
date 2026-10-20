import { Injectable, inject } from '@angular/core';
import { createAnalytics, type Analytics as EagleAnalytics } from '@digitalspace/eagle-analytics-client';
import { ConfigService } from '../config.service';
import { LoggingService } from '../logging.service';

/**
 * Page views, link and button clicks, sessions and heartbeats are tracked automatically.
 * Name manual events "Object + Past Verb", e.g. "Form Submitted".
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private configService = inject(ConfigService);
  private logger = inject(LoggingService);
  private eagleAnalytics: EagleAnalytics | null = null;
  private initialized = false;

  /**
   * Initialize analytics with configuration from ConfigService.
   * Called after ConfigService.init() completes.
   */
  initialize(): void {
    if (this.initialized) return;

    const config = this.configService.config();
    const debug = config.ENVIRONMENT === 'local';
    const apiUrl = config.EAGLE_ANALYTICS_URL || '';

    // An empty apiUrl yields a no-op instance, so an unset EAGLE_ANALYTICS_URL leaves the client off.
    this.eagleAnalytics = createAnalytics({
      apiUrl,
      sourceApp: 'eagle-admin',
      debug,
      enhancedTracking: true,
      trafficTracking: false
    });
    this.initialized = true;

    this.logger.info(
      apiUrl
        ? `Analytics initialized with API URL: ${apiUrl}`
        : 'Analytics disabled: no EAGLE_ANALYTICS_URL configured',
      'AnalyticsService'
    );
  }

  /** Track a page view */
  page(name?: string, properties?: Record<string, any>): void {
    this.eagleAnalytics?.page(name, properties);
  }

  /** Track a custom event. Use "Object + Past Verb" naming. */
  track(event: string, properties?: Record<string, any>): void {
    this.eagleAnalytics?.track(event, properties);
  }

  /** Identify user after authentication */
  identify(userId: string, traits?: Record<string, any>): void {
    this.eagleAnalytics?.identify(userId, traits);
  }

  /** Reset on logout */
  reset(): void {
    this.eagleAnalytics?.reset();
  }
}
