const CACHE = 'marchesano-gym-v12-guided-workout';
const CORE = [
  './', './index.html', './styles.css?v=10', './app.js?v=10', './manifest.webmanifest?v=10',
  './apple-touch-icon.png?v=10', './icon-192.png?v=10', './icon-512.png?v=10',
  './logo-mark.png?v=10', './marchesano-gym-v12-guided-workout'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => cached)));
});
