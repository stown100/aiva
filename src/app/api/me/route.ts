import { z } from "zod";

import { getSessionUser } from "@/server/auth/session";
import { ApiErrorCode, jsonError, jsonOk } from "@/server/lib/http";
import { getUserProfile, setUserLanguage } from "@/server/services/user.service";
import { LOCALES } from "@/shared/i18n/routing";

const updateMeSchema = z.object({
  language: z.enum(LOCALES),
});

export async function PATCH(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, ApiErrorCode.UNAUTHORIZED);
  }

  const parsed = updateMeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, ApiErrorCode.INVALID_REQUEST);
  }

  try {
    await setUserLanguage(sessionUser.id, parsed.data.language);
    return jsonOk({ ok: true });
  } catch (error) {
    console.error("[api/me PATCH]", error);
    return jsonError(500, ApiErrorCode.INTERNAL);
  }
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, ApiErrorCode.UNAUTHORIZED);
  }

  try {
    const profile = await getUserProfile(sessionUser.id);
    if (!profile) {
      return jsonError(404, ApiErrorCode.NOT_FOUND);
    }
    return jsonOk(profile);
  } catch (error) {
    console.error("[api/me]", error);
    return jsonError(500, ApiErrorCode.INTERNAL);
  }
}
