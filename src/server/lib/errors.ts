import "server-only";

import type { ApiErrorCode } from "./http";

/**
 * Domain error thrown by services; route handlers map it to the unified
 * `{ error: { code } }` response with the given HTTP status.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "AppError";
  }
}
