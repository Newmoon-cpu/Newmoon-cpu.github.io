const CACHE = 'brightnewmoon-1780695364757';
const PRE_CACHE = [
  '/',
  '/css/main.css',
  '/css/custom.css',
  '/js/boot.js',
  '/js/events.js',
  '/js/color-schema.js',
  '/img/banner.webp',
  '/img/favicon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRE_CACHE).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  // HTML — network first, cache fallback
  if (e.request.headers.get('accept') && e.request.headers.get('accept').indexOf('text/html') !== -1) {
    e.respondWith(
      fetch(e.request)
        .then(function (res) {
          var clone = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(e.request, clone); });
          return res;
        })
        .catch(function () {
          return caches.match(e.request).then(function (r) { return r || caches.match('/'); });
        })
    );
    return;
  }

  // Assets — network first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        var clone = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(e.request, clone); });
        return res;
      })
      .catch(function () {
        return caches.match(e.request);
      })
  );
});
