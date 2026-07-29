// Retirement worker: older Bean Wiki releases registered an offline cache that
// can keep an already-open tab on an outdated UI. Install immediately, remove
// every legacy cache, stop intercepting requests, then unregister itself.
const LEGACY_CACHE_PREFIX = "bean-wiki-";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(LEGACY_CACHE_PREFIX))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister()),
  );
});
