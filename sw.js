/* ====================================================== */
/* SERVICE WORKER — PWA Cache                              */
/* ====================================================== */

const CACHE_NAME = 'bach-review-v4';

const CACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/retro.css',
  './js/data.js',
  './js/map.js',
  './js/routing.js',
  './js/app.js',
  './assets/Logo_moi.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  if (url.includes('docs.google.com') || url.includes('openstreetmap.org') || url.includes('osrm.org') || url.includes('unpkg.com') || url.includes('fonts.')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
