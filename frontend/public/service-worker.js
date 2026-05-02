const CACHE_NAME = "music-app-v1";

// 🧱 App shell (static files)
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 🔧 INSTALL
self.addEventListener("install", (event) => {
  console.log("✅ Service Worker installing");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching app shell");
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

// 🚀 ACTIVATE
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑 Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// 🌐 FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 🎧 AUDIO FILES (mp3, wav)
  if (url.pathname.endsWith(".mp3") || url.pathname.endsWith(".wav")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) {
            console.log("🎧 Playing from cache:", req.url);
            return cached;
          }

          return fetch(req)
            .then((networkRes) => {
              if (networkRes && networkRes.ok) {
                console.log("⬇️ Caching audio:", req.url);
                cache.put(req, networkRes.clone());
              }
              return networkRes;
            })
            .catch(() => {
              console.log("❌ Audio not available offline:", req.url);
              return new Response("Audio not available offline", {
                status: 404,
              });
            });
        })
      )
    );
    return;
  }

  // 📦 STATIC FILES (app shell)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(req)
        .then((networkRes) => {
          return networkRes;
        })
        .catch(() => {
          // fallback for offline navigation
          if (req.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});