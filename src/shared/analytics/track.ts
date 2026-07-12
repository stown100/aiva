import type { AnalyticsEvent } from "./events";

type DataLayerWindow = Window & { dataLayer?: Array<Record<string, unknown>> };

/**
 * Analytics transport is intentionally abstracted: events go to
 * `window.dataLayer` when a tag manager is present, and to the console in
 * development. A real provider (PostHog/Amplitude) plugs in here without
 * touching call sites.
 */
export function track(event: AnalyticsEvent): void {
  const props = "props" in event ? event.props : undefined;

  if (typeof window !== "undefined") {
    (window as DataLayerWindow).dataLayer?.push({ event: event.name, ...props });
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event.name, props ?? {});
  }
}
