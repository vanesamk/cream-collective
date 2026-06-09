const CACHE_NAME = 'cream-collective-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/style.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
