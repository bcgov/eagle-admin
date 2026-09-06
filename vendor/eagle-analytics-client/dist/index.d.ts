interface AnalyticsConfig {
    /** Ingest base URL or path; events are posted to `${apiUrl}/events`. Empty disables tracking. */
    apiUrl: string;
    sourceApp: string;
    debug?: boolean;
    /** Automatic page views, clicks, heartbeat and session events, with device context. */
    enhancedTracking?: boolean;
    trafficTracking?: boolean;
    fetch?: typeof fetch;
}
interface Analytics {
    page: (name?: string, properties?: Record<string, unknown>) => void;
    track: (event: string, properties?: Record<string, unknown>) => void;
    identify: (userId: string, traits?: Record<string, unknown>) => void;
    reset: () => void;
    flush: () => Promise<void>;
    destroy: () => void;
}
declare const HEARTBEAT_MS = 30000;
declare const BATCH_SIZE = 20;
declare const FLUSH_MS = 5000;
declare function createAnalytics(config: AnalyticsConfig): Analytics;

export { type Analytics, type AnalyticsConfig, BATCH_SIZE, FLUSH_MS, HEARTBEAT_MS, createAnalytics, createAnalytics as default };
