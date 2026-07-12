import { apiGet } from "@/shared/api";

import type { StyleSummary } from "../types";

export function fetchStyles(): Promise<StyleSummary[]> {
  return apiGet<StyleSummary[]>("/api/styles");
}
