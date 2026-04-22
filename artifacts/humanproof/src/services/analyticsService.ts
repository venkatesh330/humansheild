// analyticsService.ts
// Posthog-compatible analytics client with localStorage buffering and fire-and-forget sync.

const DISTINCT_ID_KEY = 'humanproof_distinct_id';
const SESSION_ID_KEY = 'humanproof_session_id';
const BUFFER_KEY = 'humanproof_events_buffer';
const MAX_BUFFER_SIZE = 200;
const FLUSH_INTERVAL = 15000; // 15 seconds

let distinctId: string | null = null;
let sessionId: string | null = null;
let bufferedEvents: Array<{event: string; properties: Record<string, any>}> = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let lastFlush = 0;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getOrCreateDistinctId(): string {
  if (distinctId) return distinctId;
  if (typeof window === 'undefined') return '';
  try {
    const stored = sessionStorage.getItem(DISTINCT_ID_KEY);
    if (stored) {
      distinctId = stored;
    } else {
      distinctId = generateId();
      sessionStorage.setItem(DISTINCT_ID_KEY, distinctId);
    }
  } catch {
    distinctId = generateId();
  }
  return distinctId;
}

function getOrCreateSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return '';
  try {
    const stored = sessionStorage.getItem(SESSION_ID_KEY);
    const now = Date.now();
    if (stored) {
      const [id, timestamp] = stored.split(':');
      if (now - parseInt(timestamp) < 30 * 60 * 1000) {
        sessionId = id;
        return sessionId;
      }
    }
    sessionId = generateId();
    sessionStorage.setItem(SESSION_ID_KEY, `${sessionId}:${now}`);
  } catch {
    sessionId = generateId();
  }
  return sessionId;
}

function loadBufferedEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(BUFFER_KEY);
    bufferedEvents = stored ? JSON.parse(stored) : [];
  } catch {
    bufferedEvents = [];
  }
}

function saveBufferedEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify(bufferedEvents.slice(-MAX_BUFFER_SIZE)));
  } catch {}
}

function sendBeaconOrFetch(data: string): void {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/v1/analytics/track', data);
    } else {
      fetch('/api/v1/analytics/track', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        signal: AbortSignal.timeout(3000),
      }).catch(() => undefined);
    }
  } catch {}
}

export function track(event: string, properties: Record<string, any> = {}): void {
  const entry = { event, properties: { ...properties, timestamp: new Date().toISOString() } };
  bufferedEvents.push(entry);
  saveBufferedEvents();
}

export function page(name: string, properties: Record<string, any> = {}): void {
  track('page_view', { page_name: name, ...properties });
}

export function identify(userId: string, traits: Record<string, any> = {}): void {
  track('identify', { user_id: userId, ...traits });
}

export function flush(force = false): void {
  if (!force && Date.now() - lastFlush < 1000) return;
  if (bufferedEvents.length === 0) return;

  const id = getOrCreateDistinctId();
  const sid = getOrCreateSessionId();
  const payload = JSON.stringify({
    distinct_id: id,
    session_id: sid,
    events: bufferedEvents,
  });

  sendBeaconOrFetch(payload);
  lastFlush = Date.now();
  bufferedEvents = [];
  saveBufferedEvents();
}

export function reset(): void {
  bufferedEvents = [];
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(DISTINCT_ID_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem(BUFFER_KEY);
    } catch {}
  }
  distinctId = null;
  sessionId = null;
}

export function getDistinctId(): string {
  return getOrCreateDistinctId();
}

export function getBufferedEvents() {
  return [...bufferedEvents];
}

export const analytics = {
  track,
  page,
  identify,
  flush,
  reset,
  getDistinctId,
  getBufferedEvents,
};

if (typeof window !== 'undefined') {
  loadBufferedEvents();
  flushTimer = setInterval(() => flush(), FLUSH_INTERVAL);
  window.addEventListener('pagehide', () => flush(true));
  window.addEventListener('beforeunload', () => flush(true));
}
