"use client";

import { useEffect } from "react";

/** Registers the service worker in production builds only. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("[pwa] service worker registration failed", error);
    });
  }, []);

  return null;
}
