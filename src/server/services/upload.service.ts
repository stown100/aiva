import "server-only";

import { randomUUID } from "node:crypto";

import { fileTypeFromBuffer } from "file-type";
import convertHeic from "heic-convert";
import sharp from "sharp";

import { IMAGE_MAX_DIMENSION_PX, UPLOAD_MAX_SIZE_BYTES } from "@/shared/config";

import { AppError } from "../lib/errors";
import { ApiErrorCode } from "../lib/http";
import { insertOriginalImage } from "../repositories/original-image.repository";
import { createSignedUrl, STORAGE_BUCKETS, uploadObject } from "../storage/object-storage";

const ACCEPTED_INPUT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const JPEG_QUALITY = 85;

export interface UploadedPhotoDto {
  originalImageId: string;
  previewUrl: string;
  width: number;
  height: number;
}

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Normalizes any accepted upload to a clean JPEG: HEIC/HEIF is decoded first
 * (sharp prebuilds lack a HEIF decoder), `rotate()` bakes in the EXIF
 * orientation, and re-encoding without `withMetadata()` strips all EXIF/GPS
 * metadata.
 */
async function processImage(input: Buffer, mime: string): Promise<ProcessedImage> {
  let source = input;

  if (mime === "image/heic" || mime === "image/heif") {
    const converted = await convertHeic({
      buffer: new Uint8Array(source),
      format: "JPEG",
      quality: 0.95,
    });
    source = Buffer.from(converted);
  }

  const { data, info } = await sharp(source)
    .rotate()
    .resize(IMAGE_MAX_DIMENSION_PX, IMAGE_MAX_DIMENSION_PX, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return { buffer: data, width: info.width, height: info.height };
}

export async function uploadOriginalPhoto(userId: string, file: File): Promise<UploadedPhotoDto> {
  if (file.size === 0) {
    throw new AppError(400, ApiErrorCode.INVALID_REQUEST, "empty file");
  }
  if (file.size > UPLOAD_MAX_SIZE_BYTES) {
    throw new AppError(413, ApiErrorCode.UPLOAD_TOO_LARGE);
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // MIME is detected from magic bytes — the client-provided type is untrusted.
  const detected = await fileTypeFromBuffer(inputBuffer);
  if (!detected || !ACCEPTED_INPUT_MIME.has(detected.mime)) {
    throw new AppError(415, ApiErrorCode.UNSUPPORTED_FORMAT, `detected: ${detected?.mime}`);
  }

  let processed: ProcessedImage;
  try {
    processed = await processImage(inputBuffer, detected.mime);
  } catch (error) {
    throw new AppError(
      415,
      ApiErrorCode.UNSUPPORTED_FORMAT,
      `decode failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const storagePath = `${userId}/${randomUUID()}.jpg`;
  await uploadObject(STORAGE_BUCKETS.originals, storagePath, processed.buffer, "image/jpeg");

  const record = await insertOriginalImage({
    userId,
    storagePath,
    format: "jpeg",
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.buffer.byteLength,
  });

  const previewUrl = await createSignedUrl(STORAGE_BUCKETS.originals, storagePath);

  return {
    originalImageId: record.id,
    previewUrl,
    width: processed.width,
    height: processed.height,
  };
}
