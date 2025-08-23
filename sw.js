/*
  Enhanced Service Worker for Music Blocks Offline Support
*/

const CACHE_NAME = "musicblocks-cache-v1";
const RUNTIME_CACHE = "musicblocks-runtime-cache-v1";

// Core files that should be cached for offline functionality
const precacheFiles = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./css/keyboard.css", 
    "./css/themes.css",
    "./css/activities.css",
    "./lib/materialize-iso.css",
    "./fonts/material-icons.css",
    "./activity/activity-icon-color-512.png",
    "./images/logo.svg",
    // Core JavaScript libraries
    "./lib/jquery-2.1.4.min.js",
    "./lib/jquery-ui.js",
    "./lib/materialize.min.js",
    "./lib/webL10n.js",
    "./lib/Tone.js",
    "./lib/raphael.min.js",
    "./lib/easeljs.min.js",
    "./lib/tweenjs.min.js",
    "./lib/require.js",
    // Essential Music Blocks files
    "./js/loader.js",
    "./localization.ini",
    // Fallback offline page
    "./offline.html"
];

// Install event - cache core files
self.addEventListener("install", function (event) {
    console.log("[Music Blocks SW] Install Event processing");
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log("[Music Blocks SW] Caching core files during install");
                return cache.addAll(precacheFiles);
            })
            .then(function() {
                console.log("[Music Blocks SW] Skip waiting on install");
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", function (event) {
    console.log("[Music Blocks SW] Activate Event processing");
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log("[Music Blocks SW] Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log("[Music Blocks SW] Claiming clients for current page");
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", function (event) {
    // Skip non-GET requests
    if (event.request.method !== "GET") {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version if available
                if (response) {
                    console.log("[Music Blocks SW] Serving from cache:", event.request.url);
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(function(response) {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache runtime files
                        if (shouldCacheRequest(event.request)) {
                            const responseToCache = response.clone();
                            caches.open(RUNTIME_CACHE)
                                .then(function(cache) {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch(function(error) {
                        console.log("[Music Blocks SW] Network request failed:", error);
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html');
                        }
                        
                        // Return a generic offline response for other requests
                        return new Response('Offline - content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                        });
                    });
            })
    );
});

// Helper function to determine if request should be cached
function shouldCacheRequest(request) {
    const url = new URL(request.url);
    
    // Cache same-origin requests
    if (url.origin === location.origin) {
        // Don't cache API calls or dynamic content
        if (url.pathname.includes('/api/') || 
            url.pathname.includes('/socket.io/') ||
            url.search.includes('_') || // Avoid cache-busting URLs
            url.pathname.includes('hot-update')) {
            return false;
        }
        return true;
    }
    
    // Cache specific external resources (fonts, CDN resources)
    if (url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com' ||
        url.hostname === 'cdnjs.cloudflare.com') {
        return true;
    }
    
    return false;
}

// Message event for manual cache updates
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'UPDATE_CACHE') {
        // Force update cache
        event.waitUntil(
            caches.open(CACHE_NAME).then(function(cache) {
                return cache.addAll(precacheFiles);
            })
        );
    }
});

// Background sync for when connection is restored
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log("[Music Blocks SW] Background sync triggered");
        event.waitUntil(
            // Update cache when connection is restored
            caches.open(CACHE_NAME).then(function(cache) {
                return cache.addAll(precacheFiles);
            })
        );
    }
});

// Push notifications (for future features)
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: './activity/activity-icon-color-512.png',
            badge: './activity/activity-icon-color-512.png',
            data: data.data
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});