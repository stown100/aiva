import "server-only";

/**
 * In-memory sliding-window limiter — MVP placeholder good for a single
 * instance. The call sites keep the same shape when this is swapped for a
 * shared store (e.g. Upstash Redis) in production.
 */
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}
