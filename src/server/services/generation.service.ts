import "server-only";

import { AppError } from "../lib/errors";
import { API_ERROR_CODES } from "../lib/http";
import { consumeCredit, refundCredit } from "../repositories/credit.repository";
import {
  findGenerationById,
  findGenerationForUser,
  insertGeneration,
  updateGenerationStatus,
  type GenerationDbStatus,
} from "../repositories/generation.repository";
import {
  findOriginalImageById,
  findOriginalImageForUser,
} from "../repositories/original-image.repository";
import { findStyleWithPrompt } from "../repositories/style.repository";
import {
  getNextVersionNumber,
  insertVariant,
  listVariants,
} from "../repositories/variant.repository";
import {
  createSignedUrl,
  downloadObject,
  STORAGE_BUCKETS,
  uploadObject,
} from "../storage/object-storage";
import { openAiImageProvider } from "./ai/openai-image-provider";
import type { ImageAiProvider, ImageTargetSize } from "./ai/types";

const provider: ImageAiProvider = openAiImageProvider;

export interface GenerationVariantDto {
  id: string;
  versionNumber: number;
  imageUrl: string;
}

export interface GenerationDetailDto {
  id: string;
  styleId: string;
  status: GenerationDbStatus;
  errorCode: string | null;
  variants: GenerationVariantDto[];
}

function pickTargetSize(width: number | null, height: number | null): ImageTargetSize {
  if (width && height) {
    if (width >= height * 1.2) return "1536x1024";
    if (height >= width * 1.2) return "1024x1536";
  }
  return "1024x1024";
}

/**
 * Creates a generation and spends one credit. The heavy AI work is done by
 * `runGeneration`, which the route schedules after the response is sent.
 */
export async function startGeneration(
  userId: string,
  input: { originalImageId: string; styleId: string },
): Promise<{ generationId: string }> {
  const original = await findOriginalImageForUser(input.originalImageId, userId);
  if (!original) throw new AppError(404, API_ERROR_CODES.notFound, "original image not found");

  const style = await findStyleWithPrompt(input.styleId);
  if (!style) throw new AppError(404, API_ERROR_CODES.notFound, "style not found");

  const generation = await insertGeneration({
    userId,
    originalImageId: original.id,
    styleId: style.id,
    promptVersion: style.prompt_version,
  });

  const hasCredit = await consumeCredit(userId, generation.id);
  if (!hasCredit) {
    await updateGenerationStatus(generation.id, "failed", API_ERROR_CODES.noCredits);
    throw new AppError(402, API_ERROR_CODES.noCredits);
  }

  return { generationId: generation.id };
}

/** Spends one credit and prepares an existing generation for another version. */
export async function requestNewVariant(
  userId: string,
  generationId: string,
): Promise<{ generationId: string }> {
  const generation = await findGenerationForUser(generationId, userId);
  if (!generation) throw new AppError(404, API_ERROR_CODES.notFound);

  if (generation.status === "pending" || generation.status === "processing") {
    throw new AppError(409, API_ERROR_CODES.invalidRequest, "generation is still in progress");
  }

  const hasCredit = await consumeCredit(userId, generationId);
  if (!hasCredit) throw new AppError(402, API_ERROR_CODES.noCredits);

  await updateGenerationStatus(generationId, "pending");
  return { generationId };
}

/**
 * The background worker: transforms the photo and appends the next variant.
 * Self-contained on purpose — it re-reads everything by id, so it can run
 * detached from the request that scheduled it.
 */
export async function runGeneration(generationId: string): Promise<void> {
  const generation = await findGenerationById(generationId);
  if (!generation || generation.status === "processing") return;

  try {
    await updateGenerationStatus(generationId, "processing");

    const [original, style] = await Promise.all([
      findOriginalImageById(generation.original_image_id),
      findStyleWithPrompt(generation.style_id),
    ]);
    if (!original || !style) throw new Error("generation input rows missing");

    const sourceImage = await downloadObject(STORAGE_BUCKETS.originals, original.storage_path);

    const resultImage = await provider.transform({
      image: sourceImage,
      mimeType: "image/jpeg",
      prompt: style.prompt_template,
      targetSize: pickTargetSize(original.width, original.height),
    });

    const versionNumber = await getNextVersionNumber(generationId);
    const storagePath = `${generation.user_id}/${generationId}/v${versionNumber}.png`;
    await uploadObject(STORAGE_BUCKETS.results, storagePath, resultImage, "image/png");
    await insertVariant({ generationId, versionNumber, storagePath });

    await updateGenerationStatus(generationId, "completed");
  } catch (error) {
    console.error(`[generation ${generationId}]`, error);
    await updateGenerationStatus(generationId, "failed", API_ERROR_CODES.generationFailed);
    await refundCredit(generation.user_id, generationId);
  }
}

/** Polled by the client; signs fresh URLs for every variant. */
export async function getGenerationDetail(
  userId: string,
  generationId: string,
): Promise<GenerationDetailDto> {
  const generation = await findGenerationForUser(generationId, userId);
  if (!generation) throw new AppError(404, API_ERROR_CODES.notFound);

  const variants = await listVariants(generationId);
  const variantDtos = await Promise.all(
    variants.map(async (variant) => ({
      id: variant.id,
      versionNumber: variant.version_number,
      imageUrl: await createSignedUrl(STORAGE_BUCKETS.results, variant.storage_path),
    })),
  );

  return {
    id: generation.id,
    styleId: generation.style_id,
    status: generation.status,
    errorCode: generation.error_code,
    variants: variantDtos,
  };
}
