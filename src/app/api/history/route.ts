import { getSessionUser } from "@/server/auth/session";
import { ApiErrorCode, jsonError, jsonOk } from "@/server/lib/http";
import { getUserHistory } from "@/server/services/generation.service";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return jsonError(401, ApiErrorCode.UNAUTHORIZED);
  }

  try {
    const items = await getUserHistory(sessionUser.id);
    return jsonOk(items);
  } catch (error) {
    console.error("[api/history]", error);
    return jsonError(500, ApiErrorCode.INTERNAL);
  }
}
