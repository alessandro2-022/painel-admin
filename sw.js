// This service worker is currently not in use.
// It can be used for caching assets and enabling offline functionality in the future.

self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // Add a call to skipWaiting here if you want the service worker to activate immediately
  // self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', (event) => {
  // This is a pass-through fetch handler.
  // It doesn't do any caching.
  // event.respondWith(fetch(event.request));
});