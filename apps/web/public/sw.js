// Service Worker for AI-BOS Vendor Portal
const CACHE_NAME = "vendor-portal-v1";
const RUNTIME_CACHE = "vendor-portal-runtime-v1";

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/documents",
  "/payments",
  "/statements",
  "/messages",
  "/manifest.json",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
              );
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip API routes (always fetch from network)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Skip external URLs
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If offline and no cache, return offline page
          if (request.destination === "document") {
            return caches.match("/");
          }
        });
    })
  );
});

// Background sync for offline actions (if needed)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync
      Promise.resolve()
    );
  }
});

// Push notifications (if needed)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "AI-BOS Vendor Portal";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "notification",
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow(event.notification.data?.url || "/");
      })
  );
});
