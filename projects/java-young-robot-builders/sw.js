/* Robot Builders service worker: caches the course shell so the workshop
   works offline after the first visit. It never touches other origins. */
const CACHE = "robot-builders-v1";
const SHELL = [
  "./",
  "./index.html",
  "./course.html",
  "./geometry-bench.html",
  "./java-reference.html",
  "./examples.html",
  "./discover.html",
  "./assets/styles.css",
  "./robots-building-robots.jpg",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((hit) => {
      const network = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => hit);
      return hit || network;
    })
  );
});
