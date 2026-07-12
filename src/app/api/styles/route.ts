import { API_ERROR_CODES, jsonError, jsonOk } from "@/server/lib/http";
import { getStyleCatalog } from "@/server/services/style.service";

export async function GET() {
  try {
    const styles = await getStyleCatalog();
    return jsonOk(styles, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("[api/styles]", error);
    return jsonError(500, API_ERROR_CODES.internal);
  }
}
