const CACHE = 'marchesano-gym-v7-exercise-library-online';
const CORE = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest?v=6',
  './apple-touch-icon.png?v=6', './icon-192.png?v=6', './icon-512.png?v=6',
  './logo-mark.png?v=6', './marchesano-gym-logo.png?v=6'
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
