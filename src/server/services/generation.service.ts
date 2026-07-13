import "server-only";

import { FREE_MONTHLY_GENERATIONS_PER_IP } from "@/shared/config/credits";
import { GenerationStatus, SubscriptionStatus } from "@/shared/types";

import { AppError } from "../lib/errors";
import { ApiErrorCode } from "../lib/http";
import { consumeCredit, refundCredit } from "../repositories/credit.repository";
import {
  findGenerationById,
  findGenerationForUser,
  insertGeneration,
  listGenerationsByUser,
  updateGenerationClientIpHash,
  updateGenerationStatus,
} from "../repositories/generation.repository";
import { consumeIpQuota, refundIpQuota } from "../repositories/ip-quota.repository";
import {
  findOriginalImageById,
  findOriginalImageForUser,
} from "../repositories/original-image.repository";
import { findStyleWithPrompt } from "../repositories/style.repository";
import { findUserById } from "../repositories/user.repository";
import {
  getNextVersionNumber,
  insertVariant,
  listVariants,
  listVariantsForGenerations,
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
  status: GenerationStatus;
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
 * Counts a free-plan spend against the caller's (hashed) IP, so fresh accounts
 * created from the same address cannot farm free credits. Returns the IP hash
 * the spend was charged to; null means nothing was consumed (pro user or
 * unknown IP). Deliberately reports the cap as NO_CREDITS — the client shows
 * the same out-of-credits screen and the mechanism stays invisible to abusers.
 */
async function chargeFreeIpQuota(
  userId: string,
  clientIpHash: string | null,
): Promise<string | null> {
  if (!clientIpHash) return null;

  const user = await findUserById(userId);
  if (user?.subscription_status !== SubscriptionStatus.FREE) return null;

  const withinQuota = await consumeIpQuota(clientIpHash, FREE_MONTHLY_GENERATIONS_PER_IP);
  if (!withinQuota) throw new AppError(402, ApiErrorCode.NO_CREDITS);

  return clientIpHash;
}

/**
 * Creates a generation and spends one credit. The heavy AI work is done by
 * `runGeneration`, which the route schedules after the response is sent.
 */
export async function startGeneration(
  userId: string,
  input: { originalImageId: string; styleId: string },
  clientIpHash: string | null,
): Promise<{ generationId: string }> {
  const original = await findOriginalImageForUser(input.originalImageId, userId);
  if (!original) throw new AppError(404, ApiErrorCode.NOT_FOUND, "original image not found");

  const style = await findStyleWithPrompt(input.styleId);
  if (!style) throw new AppError(404, ApiErrorCode.NOT_FOUND, "style not found");

  const chargedIpHash = await chargeFreeIpQuota(userId, clientIpHash);

  const generation = await insertGeneration({
    userId,
    originalImageId: original.id,
    styleId: style.id,
    promptVersion: style.prompt_version,
    clientIpHash: chargedIpHash,
  });

  const hasCredit = await consumeCredit(userId, generation.id);
  if (!hasCredit) {
    if (chargedIpHash) await refundIpQuota(chargedIpHash);
    await updateGenerationStatus(generation.id, GenerationStatus.FAILED, ApiErrorCode.NO_CREDITS);
    throw new AppError(402, ApiErrorCode.NO_CREDITS);
  }

  return { generationId: generation.id };
}

/** Spends one credit and prepares an existing generation for another version. */
export async function requestNewVariant(
  userId: string,
  generationId: string,
  clientIpHash: string | null,
): Promise<{ generationId: string }> {
  const generation = await findGenerationForUser(generationId, userId);
  if (!generation) throw new AppError(404, ApiErrorCode.NOT_FOUND);

  if (
    generation.status === GenerationStatus.PENDING ||
    generation.status === GenerationStatus.PROCESSING
  ) {
    throw new AppError(409, ApiErrorCode.INVALID_REQUEST, "generation is still in progress");
  }

  const chargedIpHash = await chargeFreeIpQuota(userId, clientIpHash);

  const hasCredit = await consumeCredit(userId, generationId);
  if (!hasCredit) {
    if (chargedIpHash) await refundIpQuota(chargedIpHash);
    throw new AppError(402, ApiErrorCode.NO_CREDITS);
  }

  // Rebind so a failed run refunds this spend's IP, not the original one's.
  await updateGenerationClientIpHash(generationId, chargedIpHash);
  await updateGenerationStatus(generationId, GenerationStatus.PENDING);
  return { generationId };
}

/**
 * The background worker: transforms the photo and appends the next variant.
 * Self-contained on purpose — it re-reads everything by id, so it can run
 * detached from the request that scheduled it.
 */
export async function runGeneration(generationId: string): Promise<void> {
  const generation = await findGenerationById(generationId);
  if (!generation || generation.status === GenerationStatus.PROCESSING) return;

  try {
    await updateGenerationStatus(generationId, GenerationStatus.PROCESSING);

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

    await updateGenerationStatus(generationId, GenerationStatus.COMPLETED);
  } catch (error) {
    console.error(`[generation ${generationId}]`, error);
    await updateGenerationStatus(generationId, GenerationStatus.FAILED, ApiErrorCode.GENERATION_FAILED);
    await refundCredit(generation.user_id, generationId);
    if (generation.client_ip_hash) await refundIpQuota(generation.client_ip_hash);
  }
}

const HISTORY_LIMIT = 50;

export interface HistoryItemDto {
  id: string;
  styleId: string;
  createdAt: string;
  previewUrl: string;
  versionsCount: number;
}

/** Completed generations with a signed thumbnail of the latest variant. */
export async function getUserHistory(userId: string): Promise<HistoryItemDto[]> {
  const generations = await listGenerationsByUser(userId, HISTORY_LIMIT);
  const variants = await listVariantsForGenerations(generations.map((g) => g.id));

  const latestByGeneration = new Map<string, { storagePath: string; count: number }>();
  for (const variant of variants) {
    const current = latestByGeneration.get(variant.generation_id);
    latestByGeneration.set(variant.generation_id, {
      storagePath: variant.storage_path, // variants are sorted ascending — the last one wins
      count: (current?.count ?? 0) + 1,
    });
  }

  return Promise.all(
    generations
      .filter((generation) => latestByGeneration.has(generation.id))
      .map(async (generation) => {
        const latest = latestByGeneration.get(generation.id)!;
        return {
          id: generation.id,
          styleId: generation.style_id,
          createdAt: generation.created_at,
          previewUrl: await createSignedUrl(STORAGE_BUCKETS.results, latest.storagePath),
          versionsCount: latest.count,
        };
      }),
  );
}

/** Polled by the client; signs fresh URLs for every variant. */
export async function getGenerationDetail(
  userId: string,
  generationId: string,
): Promise<GenerationDetailDto> {
  const generation = await findGenerationForUser(generationId, userId);
  if (!generation) throw new AppError(404, ApiErrorCode.NOT_FOUND);

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
