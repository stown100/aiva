import "server-only";

import { NextResponse } from "next/server";

/**
 * Unified API error shape: `code` is a stable identifier the client maps to
 * a localized message; `message` is for developers only.
 */
export const API_ERROR_CODES = {
  unauthorized: "unauthorized",
  notFound: "not_found",
  invalidRequest: "invalid_request",
  uploadTooLarge: "upload_too_large",
  unsupportedFormat: "unsupported_format",
  rateLimited: "rate_limited",
  internal: "internal",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export function jsonError(status: number, code: ApiErrorCode, message?: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}
