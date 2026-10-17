const CACHE = 'marchesano-gym-v22-immagini-incluse';
const CORE = [
  './', './index.html', './styles.css?v=23', './app.js?v=25', './manifest.webmanifest?v=22',
  './apple-touch-icon.png', './icon-192.png?v=21', './icon-512.png?v=21',
  './logo-mark.png', './marchesano-gym-logo.png', './panca-piana-bilanciere.webp?v=21', './panca-inclinata-manubri.webp?v=21', './squat-bilanciere.webp?v=21', './stacco-da-terra.webp?v=21', './lat-machine.webp?v=21', './pulley-basso.webp?v=21', './lento-avanti.webp?v=21', './alzate-laterali.webp?v=21', './curl-manubri.webp?v=21', './pushdown-corda.webp?v=21'
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
