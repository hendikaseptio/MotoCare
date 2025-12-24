self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open('batre3lit-cache').then(function (cache) {
            return cache.addAll([
                './',
                './index.html',
                './site.webmanifest',
                './favicon/android-chrome-192x192.png',
                './favicon/android-chrome-512x512.png',
                './manifest.json',
                'https://cdn.tailwindcss.com',
                'https://unpkg.com/react@18/umd/react.production.min.js',
                'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
                'https://unpkg.com/@babel/standalone/babel.min.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});