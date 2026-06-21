const CACHE = "miguelacc-v1";

const PRECACHE = ["/", "/offline"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, API, and admin routes
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin/")
  ) {
    return;
  }

  // Static assets: cache-first
  if (/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
            return res;
          })
      )
    );
    return;
  }

  // HTML pages: network-first, fall back to cache, then /offline
  e.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      })
      .catch(
        () =>
          caches.match(request) ||
          caches.match("/offline") ||
          new Response("Offline", { status: 503 })
      )
  );
});
