import { after } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import { API_ERROR_CODES, jsonError, jsonOk } from "@/server/lib/http";
import { checkRateLimit } from "@/server/lib/rate-limit";
import { requestNewVariant, runGeneration } from "@/server/services/generation.service";

const REGENERATIONS_PER_MINUTE = 5;

const idSchema = z.uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, API_ERROR_CODES.unauthorized);
  }

  if (!checkRateLimit(`generate:${sessionUser.id}`, REGENERATIONS_PER_MINUTE, 60_000)) {
    return jsonError(429, API_ERROR_CODES.rateLimited);
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return jsonError(400, API_ERROR_CODES.invalidRequest);
  }

  try {
    const { generationId } = await requestNewVariant(sessionUser.id, id);
    after(() => runGeneration(generationId));
    return jsonOk({ generationId }, { status: 202 });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError(error.status, error.code);
    }
    console.error("[api/generations/:id/variants]", error);
    return jsonError(500, API_ERROR_CODES.internal);
  }
}
