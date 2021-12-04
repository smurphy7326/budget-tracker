const FILES_TO_CACHE = [
    "/",
    "./public/index.html",
    "./public/js/index.js",
    "./public/css/style.css",
    "./public/icons/icon-72x72.png",
    "./public/icons/icon-96x96.png",
    "./public/icons/icon-128x128.png",
    "./public/icons/icon-144x144.png",
    "./public/icons/icon-152x152.png",
    "./public/icons/icon-192x192.png",
    "./public/icons/icon-384x384.png",
    "./public/icons/icon-512x512.png",

];

// Install the service worker that again should be mostly the same in all different applications

self.addEventListener('install', function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CAHCE);
        })
    );

    self.skipWaiting();

})

// Installing the service worker and having to remove old data from the cache

self.addEventListener('activate', function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// Intercept fetch requests

self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
            .open(CACHE_NAME) // maybe DATA_CACHE_NAME
            .then(cache=> {
                return fetch(evt.request)
                .then(response => {
                    // If the response was good, clone it and store it in the cache. 
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }

                    return response;
                })

                .catch(err => {
                   // if there is an error the network response will have failed and you have to try and get it from the cache
                   return cache.match(evt.request); 
                });
            })
            .catch(err => console.log(err))
        );

        return;
    }
    evt.respondWith(
        fetch(evt.request).catch(function() {
            return caches.match(evt.request).then(function(response) {
                if (response) {
                    return response;
                } else if (evt.request.headers.get('accept').includes('text/html'))
            {
                // return the cached home page for all requests for the different HTML pages
                return caches.match('/');
            }
          });
        })
    );
})