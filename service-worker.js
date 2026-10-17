const CACHE = 'marchesano-gym-v25-immagini-fix';
const CORE = [
  './', './index.html', './styles.css?v=24', './app.js?v=28', './manifest.webmanifest?v=23',
  './apple-touch-icon.png?v=22', './icon-192.png?v=22', './icon-512.png?v=22',
  './icon.svg?v=22', './logo-mark.png?v=22', './marchesano-gym-logo.png?v=22',
  './panca-piana-bilanciere.webp?v=25', './panca-piana-manubri.webp?v=25',
  './panca-inclinata-bilanciere.webp?v=25', './panca-inclinata-manubri.webp?v=25',
  './chest-press.webp?v=25', './croci-manubri-piana.webp?v=25', './croci-cavi.webp?v=25',
  './pec-deck.webp?v=25', './push-up.webp?v=25', './dip-petto.webp?v=25',
  './squat-bilanciere.webp?v=25', './stacco-da-terra.webp?v=25', './lat-machine.webp?v=25',
  './pulley-basso.webp?v=25', './lento-avanti.webp?v=25', './alzate-laterali.webp?v=25',
  './curl-manubri.webp?v=25', './pushdown-corda.webp?v=25'
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
