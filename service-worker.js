const CACHE_NAME = 'booking-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './index.html?homescreen=1',
  '/Booking-web-app/',
  '/Booking-web-app/index.html',
  '/Booking-web-app/index.html?homescreen=1',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install & cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate & clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch handler — prefer cache, fallback to network, fallback to index.html offline
self.addEventListener('fetch', event => {
  // For navigation requests, always try cache/network and fall back to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('./index.html')
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        // final fallback to index.html for navigations already handled above;
        return caches.match('./index.html');
      });
    })
  );
});
