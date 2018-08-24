importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');
const {strategies} = workbox;
console.log('Hello from Workbox!');

if (workbox) {
  // Cache JS
  workbox.routing.registerRoute(
    new RegExp('.*\.js'),
    workbox.strategies.cacheFirst({
      cacheName: 'js-cache'})
  );
  // Cache HTML
  workbox.routing.registerRoute(
    new RegExp('.*\.html'),
    workbox.strategies.cacheFirst({
      cacheName: 'html-cache',
    })
  );
  // Cache CSS
  workbox.routing.registerRoute(
    new RegExp('/.*\.css/'),
    workbox.strategies.cacheFirst({
      cacheName: 'css-cache',
    })
  );
  // Cache Imgs
  workbox.routing.registerRoute(
    new RegExp('/.*\.(?:png|jpg|jpeg|svg|gif|webp)/'),
    workbox.strategies.cacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 30,
          // Cache for a maximum of a week
          maxAgeSeconds: 7 * 24 * 60 * 60,
        })
      ],
    })
  );
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

// When offline intercept http calls and respond with cache
self.addEventListener('fetch', (event) => {
  if (event.request.url) {
    const cacheFirst = strategies.cacheFirst();
    event.respondWith(cacheFirst.makeRequest({request: event.request}));
  }
});