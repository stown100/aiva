import { getSessionUser } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import { API_ERROR_CODES, jsonError, jsonOk } from "@/server/lib/http";
import { checkRateLimit } from "@/server/lib/rate-limit";
import { uploadOriginalPhoto } from "@/server/services/upload.service";

const UPLOADS_PER_MINUTE = 10;

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, API_ERROR_CODES.unauthorized);
  }

  if (!checkRateLimit(`upload:${sessionUser.id}`, UPLOADS_PER_MINUTE, 60_000)) {
    return jsonError(429, API_ERROR_CODES.rateLimited);
  }

  let file: FormDataEntryValue | null;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return jsonError(400, API_ERROR_CODES.invalidRequest, "expected multipart form data");
  }

  if (!(file instanceof File)) {
    return jsonError(400, API_ERROR_CODES.invalidRequest, "missing file field");
  }

  try {
    const result = await uploadOriginalPhoto(sessionUser.id, file);
    return jsonOk(result);
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError(error.status, error.code);
    }
    console.error("[api/upload]", error);
    return jsonError(500, API_ERROR_CODES.internal);
  }
}
