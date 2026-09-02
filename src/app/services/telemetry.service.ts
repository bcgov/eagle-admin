import { Injectable } from '@angular/core';
import type { ApplicationInsights, ITelemetryItem } from '@microsoft/applicationinsights-web';

const QUERY_FIELDS = ['uri', 'target', 'name', 'message'];
const stripQuery = (value: string) => value.replace(/\?.*$/, '');

/** Send browser errors to Azure Application Insights. Errors only — successful traffic is dropped. */
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private appInsights?: ApplicationInsights;

  async init(connectionString: string | undefined, role: string, correlationHosts: string[]): Promise<void> {
    if (!connectionString) return;
    const { ApplicationInsights } = await this.loadSdk();
    const appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableCorsCorrelation: true,
        correlationHeaderDomains: correlationHosts,
        enableAutoRouteTracking: false,
        // zone.js only forwards rejections raised inside the Angular zone to ErrorHandler
        enableUnhandledPromiseRejectionTracking: true
      }
    });
    appInsights.loadAppInsights();
    appInsights.addTelemetryInitializer(item => this.scrub(item, role));
    this.appInsights = appInsights;
  }

  trackException(error: unknown, properties?: Record<string, string>): void {
    this.appInsights?.trackException(
      { exception: error instanceof Error ? error : new Error(String(error)) },
      properties
    );
  }

  /** Seam so specs can supply a fake SDK; production always loads the real lazy chunk. */
  protected loadSdk(): Promise<typeof import('@microsoft/applicationinsights-web')> {
    return import('@microsoft/applicationinsights-web');
  }

  /** Tag the role, drop successful dependencies, strip query strings (they carry tokens). */
  scrub(item: ITelemetryItem, role: string): boolean {
    item.tags = item.tags || {};
    item.tags['ai.cloud.role'] = role;
    const data: any = item.baseData;
    if (item.baseType === 'RemoteDependencyData' && data?.success !== false) return false;
    if (!data) return true;
    for (const field of QUERY_FIELDS) {
      if (typeof data[field] === 'string') data[field] = stripQuery(data[field]);
    }
    // trackException keeps its message a level down, and HTTP failures log the URL there
    for (const exception of data.exceptions ?? []) {
      if (typeof exception.message === 'string') exception.message = stripQuery(exception.message);
    }
    return true;
  }
}
