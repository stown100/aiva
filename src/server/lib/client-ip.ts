import "server-only";

import { createHmac } from "node:crypto";

import { getServerEnv } from "./env";

/**
 * HMAC-SHA256 of the caller's IP (first hop of `x-forwarded-for`, falling
 * back to `x-real-ip`). Only the hash ever leaves this module, so no raw IP
 * is stored anywhere; the secret pepper keeps the small IPv4 space from being
 * enumerable offline. Null when neither header is present (e.g. local dev) —
 * IP-based limits are skipped in that case.
 */
export function getClientIpHash(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim();
  if (!ip) return null;

  return createHmac("sha256", getServerEnv().IP_HASH_SECRET).update(ip).digest("hex");
}
