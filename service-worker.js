const CACHE = 'marchesano-gym-v23-primi-dieci-esercizi';
const CORE = [
  './', './index.html', './styles.css?v=23', './app.js?v=26', './manifest.webmanifest?v=22',
  './apple-touch-icon.png', './icon-192.png?v=21', './icon-512.png?v=21',
  './logo-mark.png', './marchesano-gym-logo.png', './panca-piana-bilanciere.webp?v=23', './panca-inclinata-manubri.webp?v=23', './squat-bilanciere.webp?v=23', './stacco-da-terra.webp?v=23', './lat-machine.webp?v=23', './pulley-basso.webp?v=23', './lento-avanti.webp?v=23', './alzate-laterali.webp?v=23', './curl-manubri.webp?v=23', './pushdown-corda.webp?v=23',
  './panca-piana-manubri.webp?v=23', './panca-inclinata-bilanciere.webp?v=23', './chest-press.webp?v=23', './croci-manubri-piana.webp?v=23', './croci-cavi.webp?v=23', './pec-deck.webp?v=23', './push-up.webp?v=23', './dip-petto.webp?v=23',
  './assets/exercises/panca-piana-bilanciere.webp?v=23, './assets/exercises/panca-piana-manubri.webp?v=23, './assets/exercises/panca-inclinata-bilanciere.webp?v=23, './assets/exercises/panca-inclinata-manubri.webp?v=23, './assets/exercises/chest-press.webp?v=23, './assets/exercises/croci-manubri-piana.webp?v=23, './assets/exercises/croci-cavi.webp?v=23, './assets/exercises/pec-deck.webp?v=23, './assets/exercises/push-up.webp?v=23, './assets/exercises/dip-petto.webp?v=23
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
