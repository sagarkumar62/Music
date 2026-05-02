self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 🚨 ADD THIS BLOCK HERE 👇
  if (
    url.pathname === "/manifest.json" ||
    url.pathname.startsWith("/icons/")
  ) {
    return; // let browser handle it
  }

  // 🚨 Skip external APIs
  if (url.origin !== self.location.origin) {
    return;
  }

  // 🎧 AUDIO FILES
  if (url.pathname.endsWith(".mp3") || url.pathname.endsWith(".wav")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;

          return fetch(req)
            .then((networkRes) => {
              if (networkRes && networkRes.ok) {
                cache.put(req, networkRes.clone());
              }
              return networkRes;
            })
            .catch(() => {
              return new Response("Audio not available offline", {
                status: 404,
              });
            });
        })
      )
    );
    return;
  }

  // 📦 STATIC FILES
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).catch(() => {
          if (req.mode === "navigate") {
            return caches.match("/index.html");
          }
        })
      );
    })
  );
});