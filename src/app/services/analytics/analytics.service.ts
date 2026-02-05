import { Injectable, inject } from '@angular/core';
import Analytics from 'analytics';
import type { AnalyticsInstance } from 'analytics';
import { penguinAnalyticsPlugin } from './penguin-analytics-plugin';
import { ConfigService } from '../config.service';

interface PluginWithStartTracking {
  startTracking?: () => void;
}

/**
 * Analytics service using Analytics.io with Penguin Analytics plugin.
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
  private analytics: AnalyticsInstance | null = null;
  private plugin: PluginWithStartTracking | null = null;
  private initialized = false;

  /**
   * Initialize analytics with configuration from ConfigService.
   * Called after ConfigService.init() completes.
   */
  initialize(): void {
    if (this.initialized) return;

    const config = this.configService.config();
    const apiUrl = config.ANALYTICS_API_URL;
    
    // Skip analytics if no API URL configured
    if (!apiUrl) {
      console.log('Analytics disabled: ANALYTICS_API_URL not configured');
      this.initialized = true;
      return;
    }

    const debug = config.ANALYTICS_DEBUG ?? (config.ENVIRONMENT === 'local');

    const plugin = penguinAnalyticsPlugin({ apiUrl, sourceApp: 'eagle-admin', debug });
    this.plugin = plugin as unknown as PluginWithStartTracking;
    this.analytics = Analytics({ app: 'eagle-admin', debug, plugins: [plugin] });
    this.initialized = true;
    
    console.log('Analytics initialized with API URL:', apiUrl);
  }
  startTracking(): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized, call initialize() first');
      return;
    }
    this.plugin?.startTracking?.();
  }

  /** Track a page view */
  page(name?: string, properties?: Record<string, any>): void {
    this.analytics?.page({ name, ...properties });
  }

  /** Track a custom event. Use "Object + Past Verb" naming. */
  track(event: string, properties?: Record<string, any>): void {
    this.analytics?.track(event, properties);
  }

  /** Identify user after authentication */
  identify(userId: string, traits?: Record<string, any>): void {
    this.analytics?.identify(userId, traits);
  }

  /** Reset on logout */
  reset(): void {
    this.analytics?.reset();
  }
}
