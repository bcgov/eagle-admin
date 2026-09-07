import { Injectable, inject } from '@angular/core';
import { createAnalytics, type Analytics as EagleAnalytics } from '@digitalspace/eagle-analytics-client';
import { ConfigService } from '../config.service';
import { LoggingService } from '../logging.service';

/**
 * Analytics service backed by the eagle-analytics client.
 *
 * ## Auto-tracked events (no code needed):
 * - Page views (on route changes)
 * - Link clicks
 * - Button clicks
 * - Session and heartbeat events
 *
 * ## Manual tracking:
 * Use "Object + Past Verb" naming: "Form Submitted", "Document Downloaded"
 *
 * @example
 * ```typescript
 * // Page view (auto-tracked, but can override)
 * analytics.page('Project Details', { project_id: '123' });
 *
 * // Custom event
 * analytics.track('Report Generated', { format: 'pdf' });
 *
 * // Identify user after login
 * analytics.identify(userId, { username: 'john', roles: ['admin'] });
 * ```
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
    const debug = config.ANALYTICS_DEBUG ?? (config.ENVIRONMENT === 'local');
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
