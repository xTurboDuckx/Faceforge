const CACHE_NAME = 'faceforge-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // icons (ensure these exist)
  './icons/icon-192.png',
  './icons/icon-512.png',
  // CDN scripts won’t be cached here; browser will fetch them online.
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for navigations & same-origin requests
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  // HTML navigations: try network, fall back to cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Others: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
