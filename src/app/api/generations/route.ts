import { after } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/server/auth/session";
import { getClientIpHash } from "@/server/lib/client-ip";
import { AppError } from "@/server/lib/errors";
import { ApiErrorCode, jsonError, jsonOk } from "@/server/lib/http";
import { checkRateLimit } from "@/server/lib/rate-limit";
import { runGeneration, startGeneration } from "@/server/services/generation.service";

const GENERATIONS_PER_MINUTE = 5;

const startGenerationSchema = z.object({
  originalImageId: z.uuid(),
  styleId: z.string().min(1).max(64),
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, ApiErrorCode.UNAUTHORIZED);
  }

  if (!checkRateLimit(`generate:${sessionUser.id}`, GENERATIONS_PER_MINUTE, 60_000)) {
    return jsonError(429, ApiErrorCode.RATE_LIMITED);
  }

  const parsed = startGenerationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, ApiErrorCode.INVALID_REQUEST);
  }

  try {
    const { generationId } = await startGeneration(
      sessionUser.id,
      parsed.data,
      getClientIpHash(request),
    );
    after(() => runGeneration(generationId));
    return jsonOk({ generationId }, { status: 202 });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError(error.status, error.code);
    }
    console.error("[api/generations]", error);
    return jsonError(500, ApiErrorCode.INTERNAL);
  }
}
