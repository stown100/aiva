import { getSessionUser } from "@/server/auth/session";
import { API_ERROR_CODES, jsonError, jsonOk } from "@/server/lib/http";
import { getUserHistory } from "@/server/services/generation.service";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, API_ERROR_CODES.unauthorized);
  }

  try {
    const items = await getUserHistory(sessionUser.id);
    return jsonOk(items);
  } catch (error) {
    console.error("[api/history]", error);
    return jsonError(500, API_ERROR_CODES.internal);
  }
}
