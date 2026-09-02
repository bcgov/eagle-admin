import { Injectable } from '@angular/core';
import type { ApplicationInsights, ITelemetryItem } from '@microsoft/applicationinsights-web';

const QUERY_FIELDS = ['uri', 'target', 'name', 'message'];
const stripQuery = (value: string) => value.replace(/\?[\w%.~-]+=[^\s:)#'"]*(?:&[\w%.~-]+=[^\s:)#'"]*)*/g, '');

/** Send browser errors to Azure Application Insights. Errors only — successful traffic is dropped. */
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private appInsights?: ApplicationInsights;
  private readonly MAX_BUFFERED = 20;
  private buffer: { error: unknown; properties?: Record<string, string> }[] = [];

  async init(connectionString: string | undefined, role: string, correlationHosts: string[]): Promise<void> {
    if (!connectionString) return;
    try {
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
      const buffered = this.buffer;
      this.buffer = [];
      for (const entry of buffered) this.trackException(entry.error, entry.properties);
    } catch {
      // stale hashed chunk after a redeploy, or SDK init failure: stay off, keep buffering
    }
  }

  trackException(error: unknown, properties?: Record<string, string>): void {
    if (!this.appInsights) {
      if (this.buffer.length < this.MAX_BUFFERED) this.buffer.push({ error, properties });
      return;
    }
    this.appInsights.trackException(
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
    // trackException keeps its message and stack a level down, and HTTP failures log the URL there
    for (const exception of data.exceptions ?? []) {
      if (typeof exception.message === 'string') exception.message = stripQuery(exception.message);
      if (typeof exception.stack === 'string') exception.stack = stripQuery(exception.stack);
      for (const frame of exception.parsedStack ?? []) {
        if (typeof frame.fileName === 'string') frame.fileName = stripQuery(frame.fileName);
        if (typeof frame.assembly === 'string') frame.assembly = stripQuery(frame.assembly);
      }
    }
    return true;
  }
}
