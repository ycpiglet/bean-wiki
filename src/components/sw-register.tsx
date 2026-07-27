"use client";

import { useEffect } from "react";

const LEGACY_CACHE_PREFIX = "bean-wiki-";
const RELOAD_GUARD = "bean-wiki-service-worker-retired";

// Bean Wiki no longer needs offline caching. Retire earlier service workers and
// their page cache so a newly published UI cannot be hidden by an open tab that
// is still controlled by the legacy worker.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let cancelled = false;

    async function retireLegacyWorker() {
      const wasControlled = Boolean(navigator.serviceWorker.controller);
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister()),
      );

      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith(LEGACY_CACHE_PREFIX))
            .map((key) => window.caches.delete(key)),
        );
      }

      if (
        wasControlled &&
        !cancelled &&
        window.sessionStorage.getItem(RELOAD_GUARD) !== "1"
      ) {
        window.sessionStorage.setItem(RELOAD_GUARD, "1");
        window.location.reload();
      }
    }

    void retireLegacyWorker().catch(() => {
      // Cache cleanup is best-effort and must never block the page.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
