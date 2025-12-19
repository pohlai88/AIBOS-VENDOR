// PWA utilities for service worker registration and updates

export function registerServiceWorker(): void {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available
                  console.log("New service worker available");
                  // Optionally show update notification to user
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // Service worker updated, reload page
      window.location.reload();
    });
  }
}

export function unregisterServiceWorker(): void {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

export async function checkForUpdate(): Promise<boolean> {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return registration.installing !== null;
  }
  return false;
}
