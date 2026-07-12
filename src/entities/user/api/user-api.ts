import { apiGet } from "@/shared/api";

import type { UserProfile } from "../types";

export function fetchMe(): Promise<UserProfile> {
  return apiGet<UserProfile>("/api/me");
}
