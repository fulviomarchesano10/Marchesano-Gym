const CACHE = 'marchesano-gym-v23-immagini-corrette-1';
const CORE = [
  './', './index.html', './styles.css?v=23', './app.js?v=27', './manifest.webmanifest?v=22',
  './apple-touch-icon.png?v=21', './icon-192.png?v=21', './icon-512.png?v=21',
  './logo-mark.png', './marchesano-gym-logo.png',
  './panca-piana-bilanciere.webp?v=24', './panca-piana-manubri.webp?v=24',
  './panca-inclinata-bilanciere.webp?v=24', './panca-inclinata-manubri.webp?v=24',
  './chest-press.webp?v=24', './croci-manubri-piana.webp?v=24', './croci-cavi.webp?v=24',
  './pec-deck.webp?v=24', './push-up.webp?v=24', './dip-petto.webp?v=24',
  './squat-bilanciere.webp?v=24', './stacco-da-terra.webp?v=24', './lat-machine.webp?v=24',
  './pulley-basso.webp?v=24', './lento-avanti.webp?v=24', './alzate-laterali.webp?v=24',
  './curl-manubri.webp?v=24', './pushdown-corda.webp?v=24',
  './assets/exercises/panca-piana-bilanciere.webp?v=24', './assets/exercises/panca-piana-manubri.webp?v=24',
  './assets/exercises/panca-inclinata-bilanciere.webp?v=24', './assets/exercises/panca-inclinata-manubri.webp?v=24',
  './assets/exercises/chest-press.webp?v=24', './assets/exercises/croci-manubri-piana.webp?v=24',
  './assets/exercises/croci-cavi.webp?v=24', './assets/exercises/pec-deck.webp?v=24',
  './assets/exercises/push-up.webp?v=24', './assets/exercises/dip-petto.webp?v=24',
  './assets/exercises/squat-bilanciere.webp?v=24', './assets/exercises/stacco-da-terra.webp?v=24',
  './assets/exercises/lat-machine.webp?v=24', './assets/exercises/pulley-basso.webp?v=24',
  './assets/exercises/lento-avanti.webp?v=24', './assets/exercises/alzate-laterali.webp?v=24',
  './assets/exercises/curl-manubri.webp?v=24', './assets/exercises/pushdown-corda.webp?v=24'
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
