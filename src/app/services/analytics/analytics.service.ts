import { Injectable } from '@angular/core';
import Analytics from 'analytics';
import type { AnalyticsInstance } from 'analytics';
import { penguinAnalyticsPlugin } from './penguin-analytics-plugin';

interface EnvConfig {
  ANALYTICS_API_URL?: string;
  ANALYTICS_DEBUG?: boolean;
  ENVIRONMENT?: string;
}

declare const window: Window & { __env?: EnvConfig };

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
  private analytics: AnalyticsInstance;
  private initialized = false;

  constructor() {
    const env = window.__env || {};
    const apiUrl = env.ANALYTICS_API_URL || 'http://localhost:3001';
    const debug = env.ANALYTICS_DEBUG ?? (env.ENVIRONMENT === 'local');

    this.analytics = Analytics({
      app: 'eagle-admin',
      debug: debug,
      plugins: [
        penguinAnalyticsPlugin({
          apiUrl: apiUrl,
          sourceApp: 'eagle-admin',
          debug: debug
        })
      ]
    });

    this.initialized = true;
  }

  /** Track a page view */
  page(name?: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;
    this.analytics.page({ name, ...properties });
  }

  /** Track a custom event. Use "Object + Past Verb" naming. */
  track(event: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;
    this.analytics.track(event, properties);
  }

  /** Identify user after authentication */
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.initialized) return;
    this.analytics.identify(userId, traits);
  }

  /** Reset on logout */
  reset(): void {
    if (!this.initialized) return;
    this.analytics.reset();
  }
}
