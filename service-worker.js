const CACHE = 'marchesano-gym-v8-library';
const CORE = [
  './', './index.html', './styles.css?v=13', './app.js?v=13', './manifest.webmanifest?v=13',
  './apple-touch-icon.png', './icon-192.png?v=13', './icon-512.png?v=13',
  './logo-mark.png', './marchesano-gym-logo.png'
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
