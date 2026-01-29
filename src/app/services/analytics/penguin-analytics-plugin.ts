/**
 * Penguin Analytics Plugin for Analytics.io
 *
 * Auto-tracks: page views, link clicks, button clicks, user activity.
 * 
 * @see https://getanalytics.io/plugins/writing-plugins/
 */

import type { AnalyticsPlugin, AnalyticsInstance } from 'analytics';

export interface PenguinAnalyticsConfig {
  apiUrl: string;
  sourceApp: string;
  debug?: boolean;
}

interface EventPayload {
  timestamp: string;
  eventType: string;
  sessionId: string;
  userId?: string;
  sourceApp: string;
  properties?: Record<string, any>;
}

const sanitizeProperties = (properties?: Record<string, any>) => {
  if (!properties || typeof properties !== 'object') return undefined;
  return Object.entries(properties).reduce((acc, [key, value]) => {
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {} as Record<string, any>);
};

const normalizeEventType = (eventType?: string): string => {
  if (!eventType) return 'unknown';
  return eventType.trim().substring(0, 100) || 'unknown';
};

const sendEvent = (config: PenguinAnalyticsConfig, eventData: Partial<EventPayload>): void => {
  if (!config.apiUrl) return;

  const payload: EventPayload = {
    timestamp: new Date().toISOString(),
    sourceApp: config.sourceApp,
    sessionId: getSessionId(),
    ...eventData
  } as EventPayload;

  payload.eventType = normalizeEventType(payload.eventType);
  const cleanedProps = sanitizeProperties(payload.properties);
  if (cleanedProps) {
    payload.properties = cleanedProps;
  } else {
    delete (payload as any).properties;
  }

  if (config.debug) {
    console.log('[Penguin Analytics] Sending:', payload);
  }

  fetch(config.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(err => {
    if (config.debug) console.warn('[Penguin Analytics] Failed:', err);
  });
};

const getSessionId = (): string => {
  const key = 'penguin_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

const getBrowserContext = (): Record<string, any> => ({
  url: window.location.href,
  path: window.location.pathname,
  referrer: document.referrer,
  title: document.title,
  screen_width: window.screen.width,
  screen_height: window.screen.height,
  viewport_width: window.innerWidth,
  viewport_height: window.innerHeight,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
});

export function penguinAnalyticsPlugin(pluginConfig: PenguinAnalyticsConfig): AnalyticsPlugin {
  let config: PenguinAnalyticsConfig;
  let currentUserId: string | undefined;
  let isUserIdentified = false;
  let sessionStartTime = new Date().toISOString();
  let activityInterval: ReturnType<typeof setInterval> | null = null;
  let lastActivityTime = Date.now();

  const trackActivity = () => { lastActivityTime = Date.now(); };

  const startActivityPing = () => {
    if (activityInterval) return;

    document.addEventListener('mousemove', trackActivity, { passive: true });
    document.addEventListener('keydown', trackActivity, { passive: true });
    document.addEventListener('scroll', trackActivity, { passive: true });
    document.addEventListener('click', trackActivity, { passive: true });

    activityInterval = setInterval(() => {
      const secondsSinceActivity = Math.floor((Date.now() - lastActivityTime) / 1000);
      sendEvent(config, {
        eventType: 'User Active',
        userId: currentUserId,
        properties: {
          url: window.location.href,
          is_active: secondsSinceActivity < 60,
          seconds_since_activity: secondsSinceActivity
        }
      });
    }, 30000);
  };

  const handleLinkClick = (event: MouseEvent) => {
    if (!isUserIdentified) return;
    
    const link = (event.target as HTMLElement).closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    const isExternal = href.startsWith('http') || href.startsWith('//');
    
    const send = () => sendEvent(config, {
      eventType: 'Link Clicked',
      userId: currentUserId,
      properties: {
        link_url: href,
        link_text: link.textContent?.trim().substring(0, 100) || '',
        link_type: isExternal ? 'external' : 'internal',
        path: window.location.pathname,
        section: link.closest('[data-section]')?.getAttribute('data-section') || null
      }
    });

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(send);
    } else {
      setTimeout(send, 0);
    }
  };

  const handleButtonClick = (event: MouseEvent) => {
    if (!isUserIdentified) return;
    
    const button = (event.target as HTMLElement).closest('button, [role="button"], input[type="submit"]');
    if (!button) return;

    const btn = button as HTMLElement;
    
    const send = () => sendEvent(config, {
      eventType: 'Button Clicked',
      userId: currentUserId,
      properties: {
        button_text: btn.textContent?.trim().substring(0, 100) || 
                     btn.getAttribute('aria-label') || 'unknown',
        button_type: btn.getAttribute('type') || 'button',
        path: window.location.pathname,
        form_id: btn.closest('form')?.id || null,
        section: btn.closest('[data-section]')?.getAttribute('data-section') || null
      }
    });

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(send);
    } else {
      setTimeout(send, 0);
    }
  };

  return {
    name: 'penguin-analytics',
    config: pluginConfig,

    initialize: ({ config: cfg }: { config: PenguinAnalyticsConfig; instance: AnalyticsInstance }) => {
      config = cfg;
      if (config.debug) console.log('[Penguin Analytics] Initialized');
      
      // Don't start tracking until user is identified
      document.addEventListener('click', handleLinkClick, { passive: true });
      document.addEventListener('click', handleButtonClick, { passive: true });
    },

    page: ({ payload }: { payload: Record<string, any> }) => {
      if (!isUserIdentified) return;
      
      sendEvent(config, {
        eventType: 'Page Viewed',
        userId: currentUserId,
        properties: {
          page_name: payload.properties?.name || 'unknown',
          ...getBrowserContext(),
          ...payload.properties
        }
      });
    },

    track: ({ payload }: { payload: Record<string, any> }) => {
      if (!isUserIdentified) return;
      
      sendEvent(config, {
        eventType: payload.event,
        userId: currentUserId,
        properties: payload.properties
      });
    },

    identify: ({ payload }: { payload: Record<string, any> }) => {
      currentUserId = payload.userId;
      isUserIdentified = true;
      
      // Update session start time if provided in traits
      if (payload.traits?.session_start) {
        sessionStartTime = payload.traits.session_start;
      }
      
      // Start activity pings only after user is identified
      startActivityPing();
      
      sendEvent(config, {
        eventType: 'User Identified',
        userId: payload.userId,
        properties: {
          traits: payload.traits,
          session_start: sessionStartTime,
          session_id: getSessionId()
        }
      });
    },

    loaded: () => true,

    reset: () => {
      // Track session end when user logs out
      if (isUserIdentified && currentUserId) {
        sendEvent(config, {
          eventType: 'Session Ended',
          userId: currentUserId,
          properties: {
            session_end: new Date().toISOString(),
            session_start: sessionStartTime,
            session_id: getSessionId()
          }
        });
      }
      
      // Reset tracking state
      isUserIdentified = false;
      currentUserId = undefined;
      sessionStartTime = new Date().toISOString();
      
      // Clean up activity tracking
      if (activityInterval) {
        clearInterval(activityInterval);
        activityInterval = null;
      }
      
      document.removeEventListener('mousemove', trackActivity);
      document.removeEventListener('keydown', trackActivity);
      document.removeEventListener('scroll', trackActivity);
      document.removeEventListener('click', trackActivity);
    }
  };
}

export default penguinAnalyticsPlugin;
