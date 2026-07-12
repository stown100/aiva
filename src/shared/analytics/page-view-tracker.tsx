"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { track } from "./track";

/** Fires page_view on every client-side navigation (path includes the locale). */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track({ name: "page_view", props: { page: pathname } });
  }, [pathname]);

  return null;
}
