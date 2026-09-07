// src/context.ts
function browserContext(enhanced) {
  const base = {
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer || null
  };
  if (!enhanced) return base;
  return {
    ...base,
    // Full URL only under enhanced tracking: the query string can carry search terms.
    url: window.location.href,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    user_agent: navigator.userAgent,
    language: navigator.language
  };
}

// src/session.ts
var SESSION_KEY = "eagle_analytics.session_id";
function storage() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}
function newId() {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function readSession() {
  const store = storage();
  let existing;
  try {
    existing = store?.getItem(SESSION_KEY) ?? null;
  } catch {
    existing = null;
  }
  if (existing) return { id: existing, isNew: false };
  const id = newId();
  try {
    store?.setItem(SESSION_KEY, id);
  } catch {
  }
  return { id, isNew: true };
}
function clearSession() {
  try {
    storage()?.removeItem(SESSION_KEY);
  } catch {
  }
}
function readStored(key) {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function writeStored(key, value) {
  try {
    storage()?.setItem(key, value);
  } catch {
  }
}

// src/traffic.ts
var FIRST_TOUCH_KEY = "eagle_analytics.first_touch";
function determineChannel(source, medium) {
  const src = source?.toLowerCase() ?? "";
  const med = medium?.toLowerCase() ?? "";
  if (src.includes("chatgpt") || src.includes("claude") || src.includes("perplexity") || src.includes("gemini")) {
    return "chatbot";
  }
  if (med === "email" || src.includes("mail")) return "email";
  if (med.includes("cpc") || med.includes("ppc") || src === "google" || src === "bing") return "search";
  if (med === "social" || /facebook|twitter|linkedin|instagram|youtube/.test(src)) return "social";
  if (src && src.includes(window.location.hostname)) return "internal";
  if (src) return "referral";
  return "other";
}
function fromUrl() {
  const params = new URLSearchParams(window.location.search);
  const touch = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
    term: params.get("utm_term")
  };
  return touch.source || touch.medium ? touch : null;
}
function referrerHost() {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).hostname || null;
  } catch {
    return null;
  }
}
function fromReferrer() {
  const host = referrerHost();
  if (!host || host === window.location.hostname) return null;
  return { source: host, medium: "referral", campaign: null, content: null, term: null };
}
function readFirstTouch() {
  const raw = readStored(FIRST_TOUCH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function trafficSource() {
  try {
    const current = fromUrl() ?? fromReferrer();
    let first = readFirstTouch();
    if (!first && current) {
      first = current;
      writeStored(FIRST_TOUCH_KEY, JSON.stringify(current));
    }
    const touch = current ?? first;
    if (!touch) {
      return { traffic_channel: "direct", traffic_source: null, traffic_medium: null, traffic_referrer: null };
    }
    return {
      traffic_channel: determineChannel(touch.source, touch.medium),
      traffic_source: touch.source,
      traffic_medium: touch.medium,
      traffic_campaign: touch.campaign,
      traffic_content: touch.content,
      traffic_term: touch.term,
      traffic_referrer: referrerHost(),
      first_touch_source: first?.source ?? null,
      first_touch_medium: first?.medium ?? null,
      first_touch_campaign: first?.campaign ?? null
    };
  } catch {
    return null;
  }
}

// src/transport.ts
var MAX_PROPERTIES_BYTES = 8e3;
function trimTrailingSlashes(url) {
  let end = url.length;
  while (end > 0 && url[end - 1] === "/") end -= 1;
  return url.slice(0, end);
}
function normalizeEventType(eventType) {
  return eventType?.trim().substring(0, 100) || "unknown";
}
function cleanProperties(properties) {
  if (!properties) return void 0;
  const entries = Object.entries(properties).filter(([, value]) => value !== void 0);
  return entries.length ? Object.fromEntries(entries) : void 0;
}
function trySendBeacon(url, body) {
  if (typeof navigator?.sendBeacon !== "function") return false;
  try {
    return navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } catch {
    return false;
  }
}
function createTransport({ url, batchSize, doFetch, onError }) {
  let queue = [];
  const flush = async (useBeacon = false) => {
    if (!queue.length) return;
    const events = queue;
    queue = [];
    const body = JSON.stringify({ events });
    if (useBeacon && trySendBeacon(url, body)) return;
    try {
      await doFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      });
    } catch (err) {
      onError(err);
    }
  };
  return {
    enqueue: (event) => {
      queue.push(event);
      if (queue.length >= batchSize) void flush();
    },
    flush,
    size: () => queue.length
  };
}

// src/index.ts
var ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll", "click"];
var ACTIVE_WINDOW_MS = 6e4;
var TEXT_LIMIT = 100;
var HEARTBEAT_MS = 3e4;
var BATCH_SIZE = 20;
var FLUSH_MS = 5e3;
var noopAnalytics = {
  page: () => void 0,
  track: () => void 0,
  identify: () => void 0,
  reset: () => void 0,
  flush: () => Promise.resolve(),
  destroy: () => void 0
};
function text(element) {
  return element?.textContent?.trim().substring(0, TEXT_LIMIT) ?? "";
}
function attribute(element, selector, name) {
  return element?.closest(selector)?.getAttribute(name) || null;
}
function createAnalytics(config) {
  if (!config.apiUrl) return noopAnalytics;
  const debug = config.debug ?? false;
  const enhanced = config.enhancedTracking ?? false;
  const traffic = config.trafficTracking ?? false;
  const log = (message, detail) => {
    if (debug) console.warn(`[analytics] ${message}`, detail);
  };
  const transport = createTransport({
    url: `${trimTrailingSlashes(config.apiUrl)}/events`,
    batchSize: BATCH_SIZE,
    doFetch: config.fetch ?? ((input, init) => globalThis.fetch(input, init)),
    onError: (err) => log("send failed", err)
  });
  let session = readSession();
  let sessionStart = (/* @__PURE__ */ new Date()).toISOString();
  let sessionAnnounced = false;
  let userId;
  let lastActivity = Date.now();
  let destroyed = false;
  const send = (eventType, properties) => {
    if (destroyed) return;
    const cleaned = cleanProperties(properties);
    if (cleaned && new TextEncoder().encode(JSON.stringify(cleaned)).length > MAX_PROPERTIES_BYTES) {
      log("properties over the size cap, event dropped", { eventType });
      return;
    }
    transport.enqueue({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      eventType: normalizeEventType(eventType),
      sessionId: session.id,
      sourceApp: config.sourceApp,
      ...userId ? { userId } : {},
      ...cleaned ? { properties: cleaned } : {}
    });
  };
  const safe = (fn) => (...args) => {
    try {
      fn(...args);
    } catch (err) {
      log("handler failed", err);
    }
  };
  const teardown = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    teardown.push(() => target.removeEventListener(type, handler, options));
  };
  const onClick = safe((event) => {
    const target = event.target;
    if (typeof target?.closest !== "function") return;
    const link = target.closest("a");
    const href = link?.getAttribute("href");
    if (href) {
      send("Link Clicked", {
        link_url: href,
        link_text: text(link),
        link_type: href.startsWith("http") || href.startsWith("//") ? "external" : "internal",
        path: window.location.pathname,
        section: attribute(link, "[data-section]", "data-section")
      });
      return;
    }
    const button = target.closest('button, [role="button"], input[type="submit"]');
    if (!button) return;
    send("Button Clicked", {
      button_text: text(button) || button.getAttribute("aria-label") || "unknown",
      button_type: button.getAttribute("type") || "button",
      path: window.location.pathname,
      form_id: button.closest("form")?.id || null,
      section: attribute(button, "[data-section]", "data-section")
    });
  });
  const onActivity = safe(() => {
    lastActivity = Date.now();
  });
  const onHeartbeat = safe(() => {
    if (document.visibilityState === "hidden") return;
    const idleMs = Date.now() - lastActivity;
    send("User Active", {
      path: window.location.pathname,
      is_active: idleMs < ACTIVE_WINDOW_MS,
      seconds_since_activity: Math.floor(idleMs / 1e3)
    });
  });
  const endSession = () => {
    if (!sessionAnnounced) return;
    sessionAnnounced = false;
    send("Session Ended", {
      session_end: (/* @__PURE__ */ new Date()).toISOString(),
      session_start: sessionStart,
      session_id: session.id
    });
  };
  const onPageHide = safe(() => {
    endSession();
    void transport.flush(true);
  });
  const onVisibilityChange = safe(() => {
    if (document.visibilityState === "hidden") void transport.flush(true);
  });
  const timers = [setInterval(safe(() => void transport.flush()), FLUSH_MS)];
  on(window, "pagehide", onPageHide);
  on(document, "visibilitychange", onVisibilityChange);
  if (enhanced) {
    on(document, "click", onClick, { passive: true, capture: true });
    for (const type of ACTIVITY_EVENTS) on(document, type, onActivity, { passive: true });
    timers.push(setInterval(onHeartbeat, HEARTBEAT_MS));
  }
  const startSession = () => {
    if (!enhanced || !session.isNew || sessionAnnounced) return;
    sessionAnnounced = true;
    send("Session Started", {
      session_start: sessionStart,
      session_id: session.id,
      ...browserContext(enhanced),
      ...traffic ? trafficSource() : null
    });
  };
  safe(startSession)();
  return {
    page: safe((name, properties) => {
      send("Page Viewed", {
        page_name: name ?? "unknown",
        ...browserContext(enhanced),
        ...traffic ? trafficSource() : null,
        ...properties
      });
    }),
    track: safe((event, properties) => {
      send(event, properties);
    }),
    identify: safe((id, traits) => {
      userId = id;
      send("User Identified", {
        traits,
        session_id: session.id,
        session_start: sessionStart
      });
    }),
    reset: safe(() => {
      endSession();
      userId = void 0;
      clearSession();
      session = readSession();
      sessionStart = (/* @__PURE__ */ new Date()).toISOString();
      startSession();
    }),
    flush: async () => {
      try {
        await transport.flush();
      } catch (err) {
        log("flush failed", err);
      }
    },
    destroy: safe(() => {
      if (destroyed) return;
      for (const timer of timers) clearInterval(timer);
      for (const off of teardown) off();
      void transport.flush();
      destroyed = true;
    })
  };
}
var index_default = createAnalytics;
export {
  BATCH_SIZE,
  FLUSH_MS,
  HEARTBEAT_MS,
  createAnalytics,
  index_default as default
};
