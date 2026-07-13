/**
 * Domain enums shared by the client (entities/features/views) and the server
 * layer. String values match the database check constraints in
 * supabase/migrations/0001_schema.sql — never change one without the other.
 */

export enum GenerationStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum StyleCategory {
  TRENDING = "trending",
  CREATIVE = "creative",
  PROFESSIONAL = "professional",
  FUN = "fun",
}

export enum SubscriptionStatus {
  FREE = "free",
  PRO = "pro",
}

/**
 * Stable identifiers of the unified API error shape `{ error: { code } }`.
 * The client maps them to localized messages (`errors.<code>` keys).
 */
export enum ApiErrorCode {
  UNAUTHORIZED = "unauthorized",
  NOT_FOUND = "not_found",
  INVALID_REQUEST = "invalid_request",
  UPLOAD_TOO_LARGE = "upload_too_large",
  UNSUPPORTED_FORMAT = "unsupported_format",
  RATE_LIMITED = "rate_limited",
  NO_CREDITS = "no_credits",
  GENERATION_FAILED = "generation_failed",
  INTERNAL = "internal",
}
