const APP_PREFIX = "Budget-Tracker";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
    "/",
  " /icon/iconsicon-512x512.png",
  "/icon/iconsicon-384x384.png",
  "/icon/iconsicon-192x192.png",
  "/icon/iconsicon-152x152.png",
  "/icon/iconsicon-144x144.png",
  "/icon/iconsicon-128x128.png",
  "/icon/iconsicon-96x96.png",
  "/icon/iconsicon-72x72.png",
  "/css/styles.css",
  "/index.html",
  "/js/index.js",
"/manifest.json"
];
// install
self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// activate
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", evt => {
    if(evt.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', evt.request.url);
    
evt.respondWith(
                caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
            );
            return;
        }

evt.respondWith(
    caches.open(CACHE_NAME).then( cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});