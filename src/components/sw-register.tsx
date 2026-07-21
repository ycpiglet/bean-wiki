"use client";

import { useEffect } from "react";

// Registers the service worker in production only (registering in `next dev`
// would cache dev bundles and interfere with HMR).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // registration failures are non-fatal
    });
  }, []);

  return null;
}
