const CACHE = 'marchesano-gym-v20-immagini-fix';
const CORE = [
  './', './index.html', './styles.css?v=23', './app.js?v=24', './manifest.webmanifest?v=22',
  './apple-touch-icon.png', './icon-192.png?v=21', './icon-512.png?v=21',
  './logo-mark.png', './marchesano-gym-logo.png', './assets/exercises/panca-piana-bilanciere.webp?v=19', './assets/exercises/panca-inclinata-manubri.webp?v=19', './assets/exercises/squat-bilanciere.webp?v=19', './assets/exercises/stacco-da-terra.webp?v=19', './assets/exercises/lat-machine.webp?v=19', './assets/exercises/pulley-basso.webp?v=19', './assets/exercises/lento-avanti.webp?v=19', './assets/exercises/alzate-laterali.webp?v=19', './assets/exercises/curl-manubri.webp?v=19', './assets/exercises/pushdown-corda.webp?v=19', './panca-piana-bilanciere.webp?v=20', './panca-inclinata-manubri.webp?v=20', './squat-bilanciere.webp?v=20', './stacco-da-terra.webp?v=20', './lat-machine.webp?v=20', './pulley-basso.webp?v=20', './lento-avanti.webp?v=20', './alzate-laterali.webp?v=20', './curl-manubri.webp?v=20', './pushdown-corda.webp?v=20'
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
