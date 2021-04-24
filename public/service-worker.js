const APP_PREFIX = "pennysaver";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    "./manifest.json",
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png'
];

//install the service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

//activate the service worker
self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(keyList => {
          return Promise.all(
              keyList.map(key => {
                  if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                      console.log('Removing old cache data', key);
                      return caches.delete(key);
                  }
              })
          )
      })
    );
    self.clients.claim();
  });

//intercept fetch requests
self.addEventListener('fetch', function (evt) {
    evt.respondWith(
        caches.match(evt.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + evt.request.url);
                return request;
            } else {
                console.log('file is not cached, fetching : ' + evt.request.url);
                return fetch(evt.request);
            }
        })
    );
});
