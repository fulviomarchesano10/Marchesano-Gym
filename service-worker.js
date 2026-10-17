const CACHE = 'marchesano-gym-v29-network-refresh';
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('marchesano-gym-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const path = url.pathname;
  const appShell = path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('/app.js') || path.endsWith('/styles.css') || path.endsWith('/manifest.webmanifest') || path.endsWith('/service-worker.js');
  const guideImage = path.includes('/assets/exercises/') || (/\/(abduzioni-anca-macchina|affondi-camminata-manubri|alzate-frontali-manubri|alzate-laterali-manubri-poster|alzate-laterali-seduto-busto-inclinato|aperture-inverse-deltoidi-posteriori|calf-raise-bilanciere-rialzo|calf-raise-in-piedi-poster|calf-raise-seduto-poster|chest-press-poster|croci-cavi-alto-monolaterali|croci-cavi|croci-manubri-piana)\.webp$/).test(path);

  // Always try the deployed version first for app code and exercise guides.
  // A failed request may fall back to a previously cached copy for offline use.
  if (appShell || guideImage) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response && response.ok) await cache.put(request, response.clone());
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
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
