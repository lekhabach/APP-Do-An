/* ====================================================== */
/* SERVICE WORKER — PWA Cache                              */
/* ====================================================== */

const CACHE_NAME = 'bach-review-v1';

const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/retro.css',
  '/js/data.js',
  '/js/map.js',
  '/js/routing.js',
  '/js/app.js',
  '/assets/logo.svg',
  '/manifest.json',
];

// Cài đặt: cache các file tĩnh
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
  self.skipWaiting();
});

// Kích hoạt: xóa cache cũ
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

// Fetch: network-first cho data, cache-first cho assets
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Luôn fetch mới cho Google Sheets và tile bản đồ
  if (url.includes('docs.google.com') || url.includes('openstreetmap.org') || url.includes('osrm.org')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first cho assets tĩnh
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
