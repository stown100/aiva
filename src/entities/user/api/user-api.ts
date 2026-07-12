import { apiGet, apiPatch } from "@/shared/api";

import type { UserProfile } from "../types";

export function fetchMe(): Promise<UserProfile> {
  return apiGet<UserProfile>("/api/me");
}

export function updateMyLanguage(language: string): Promise<{ ok: boolean }> {
  return apiPatch<{ ok: boolean }>("/api/me", { language });
}
