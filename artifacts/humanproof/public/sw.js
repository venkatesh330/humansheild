// Service Worker for HumanProof PWA
const CACHE_VERSION = 'hp-v1-2026-04-21';
const STATIC_ASSETS = /^\/assets\//;
const API_ROUTES = /^\/api\//;
const CROSS_ORIGIN = /^https?:\/\/(?!localhost|127.0.0.1)/;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n)))
    )
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache API or cross-origin
  if (API_ROUTES.test(url.pathname) || CROSS_ORIGIN.test(event.request.url)) {
    return event.respondWith(fetch(event.request));
  }

  // Cache-first for static assets
  if (STATIC_ASSETS.test(url.pathname)) {
    return event.respondWith(
      caches.match(event.request).then(r => r || fetch(event.request).then(res => {
        const cache = caches.open(CACHE_VERSION);
        cache.then(c => c.put(event.request, res.clone()));
        return res;
      }))
    );
  }

  // Network-first for navigations, SWR elsewhere
  if (event.request.mode === 'navigate') {
    return event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }

  return event.respondWith(
    caches.match(event.request).then(r => {
      if (r) return r;
      return fetch(event.request).then(res => {
        const cache = caches.open(CACHE_VERSION);
        cache.then(c => c.put(event.request, res.clone()));
        return res;
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
