const CACHE_NAME = "music-app-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // ❌ DO NOT TOUCH external APIs/CDNs
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(fetch(req));
});