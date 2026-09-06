import { Injectable, inject } from '@angular/core';
import Analytics from 'analytics';
import type { AnalyticsInstance } from 'analytics';
import { createAnalytics, type Analytics as EagleAnalytics } from '@digitalspace/eagle-analytics-client';
import { penguinAnalyticsPlugin } from './penguin-analytics-plugin';
import { ConfigService } from '../config.service';
import { LoggingService } from '../logging.service';

interface PluginWithStartTracking {
  startTracking?: () => void;
}

/**
 * Analytics service using Analytics.io with Penguin Analytics plugin.
 *
 * Every call also goes to the eagle-analytics client while both backends run in parallel.
 *
 * ## Auto-tracked events (no code needed):
 * - Page views (on route changes)
 * - Link clicks
 * - Button clicks  
 * - User activity pings
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
  private analytics: AnalyticsInstance | null = null;
  private eagleAnalytics: EagleAnalytics | null = null;
  private plugin: PluginWithStartTracking | null = null;
  private initialized = false;

  /**
   * Initialize analytics with configuration from ConfigService.
   * Called after ConfigService.init() completes.
   */
  initialize(): void {
    if (this.initialized) return;

    const config = this.configService.config();
    const debug = config.ANALYTICS_DEBUG ?? (config.ENVIRONMENT === 'local');

    // An empty apiUrl yields a no-op instance, so an unset EAGLE_ANALYTICS_URL leaves the client off.
    this.eagleAnalytics = createAnalytics({
      apiUrl: config.EAGLE_ANALYTICS_URL || '',
      sourceApp: 'eagle-admin',
      debug,
      enhancedTracking: true,
      trafficTracking: false
    });

    const apiUrl = config.ANALYTICS_API_URL || '';

    // Skip analytics if no API URL configured
    if (!apiUrl) {
      this.logger.info('Analytics disabled: no ANALYTICS_API_URL configured', 'AnalyticsService');
      this.initialized = true;
      return;
    }

    const plugin = penguinAnalyticsPlugin({
      apiUrl,
      sourceApp: 'eagle-admin',
      debug,
      logger: {
        debug: (msg, data?) => this.logger.debug(msg, 'PenguinAnalytics', data),
        warn: (msg, data?) => this.logger.warn(msg, 'PenguinAnalytics', data)
      }
    });
    this.plugin = plugin as unknown as PluginWithStartTracking;
    this.analytics = Analytics({ app: 'eagle-admin', debug, plugins: [plugin] });
    this.initialized = true;

    this.logger.info(`Analytics initialized with API URL: ${apiUrl}`, 'AnalyticsService');
  }
  startTracking(): void {
    if (!this.initialized) {
      this.logger.warn('Analytics not initialized, call initialize() first', 'AnalyticsService');
      return;
    }
    this.plugin?.startTracking?.();
  }

  /** Track a page view */
  page(name?: string, properties?: Record<string, any>): void {
    this.analytics?.page({ name, ...properties });
    this.eagleAnalytics?.page(name, properties);
  }

  /** Track a custom event. Use "Object + Past Verb" naming. */
  track(event: string, properties?: Record<string, any>): void {
    this.analytics?.track(event, properties);
    this.eagleAnalytics?.track(event, properties);
  }

  /** Identify user after authentication */
  identify(userId: string, traits?: Record<string, any>): void {
    this.analytics?.identify(userId, traits);
    this.eagleAnalytics?.identify(userId, traits);
  }

  /** Reset on logout */
  reset(): void {
    this.analytics?.reset();
    this.eagleAnalytics?.reset();
  }
}
