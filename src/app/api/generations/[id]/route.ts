import { z } from "zod";

import { getSessionUser } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import { API_ERROR_CODES, jsonError, jsonOk } from "@/server/lib/http";
import { getGenerationDetail } from "@/server/services/generation.service";

const idSchema = z.uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, API_ERROR_CODES.unauthorized);
  }

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return jsonError(400, API_ERROR_CODES.invalidRequest);
  }

  try {
    const detail = await getGenerationDetail(sessionUser.id, id);
    return jsonOk(detail);
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError(error.status, error.code);
    }
    console.error("[api/generations/:id]", error);
    return jsonError(500, API_ERROR_CODES.internal);
  }
}
