const CACHE = 'marchesano-gym-v31-library-workout-layout';
self.addEventListener('install', event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('marchesano-gym-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const path = url.pathname;
  const appShell = path.endsWith('/') || /\/(index\.html|app\.js|styles\.css|manifest\.webmanifest|service-worker\.js)$/.test(path);
  const imageFile = /\.(webp|png|svg)$/i.test(path) && (path.includes('/assets/exercises/') || /\/(abduzioni-anca-macchina|affondi-camminata-manubri|alzate-frontali-manubri|alzate-laterali-manubri-poster|alzate-laterali-seduto-busto-inclinato|aperture-inverse-deltoidi-posteriori|calf-raise-bilanciere-rialzo|calf-raise-in-piedi-poster|calf-raise-seduto-poster|chest-press-poster|croci-cavi-alto-monolaterali|croci-cavi|croci-manubri-piana)(-thumb)?\.webp$/i.test(path));
  if (appShell || imageFile) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response && response.ok) { try { await cache.put(request, response.clone()); } catch (_) {} }
        return response;
      } catch (error) {
        const cached = await cache.match(request, { ignoreSearch: false });
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok) { try { await cache.put(request, response.clone()); } catch (_) {} }
    return response;
  })());
});
