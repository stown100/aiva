export const UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const UPLOAD_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const UPLOAD_ACCEPTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
] as const;

/** Longest image side after server-side optimization. */
export const IMAGE_MAX_DIMENSION_PX = 2048;
