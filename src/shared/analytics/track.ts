import type { AnalyticsEvent } from "./events";

/**
 * Analytics transport is intentionally abstracted: the MVP logs to the console,
 * and a real provider (PostHog/Amplitude) can be plugged in here without
 * touching call sites.
 */
export function track(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event.name, "props" in event ? event.props : {});
  }
}
