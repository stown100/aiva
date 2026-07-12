import { getSessionUser } from "@/server/auth/session";
import { API_ERROR_CODES, jsonError, jsonOk } from "@/server/lib/http";
import { getUserProfile } from "@/server/services/user.service";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, API_ERROR_CODES.unauthorized);
  }

  try {
    const profile = await getUserProfile(sessionUser.id);
    if (!profile) {
      return jsonError(404, API_ERROR_CODES.notFound);
    }
    return jsonOk(profile);
  } catch (error) {
    console.error("[api/me]", error);
    return jsonError(500, API_ERROR_CODES.internal);
  }
}
