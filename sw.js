const CACHE_NAME = 'notes-app-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './icon.svg',
    './manifest.json',
    './src/app.js',
    './src/db.js',
    './src/demo-data.js',
    './src/file-system.js',
    './src/store.js',
    './src/toast.js',
    './src/ui.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
