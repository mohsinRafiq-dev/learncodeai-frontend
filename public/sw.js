self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip service worker for download endpoints - don't respondWith at all
  if (url.pathname.includes('/download')) {
    // Don't intercept - let the browser handle it directly
    // This is done by NOT calling event.respondWith()
    return;
  }
  
  // For other requests, respond with the fetch
  event.respondWith(
    fetch(event.request)
  );
});
