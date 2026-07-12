import { apiGet, apiPost } from "@/shared/api";

import type { GenerationDetail } from "../types";

export function startGeneration(input: {
  originalImageId: string;
  styleId: string;
}): Promise<{ generationId: string }> {
  return apiPost<{ generationId: string }>("/api/generations", input);
}

export function fetchGeneration(generationId: string): Promise<GenerationDetail> {
  return apiGet<GenerationDetail>(`/api/generations/${generationId}`);
}

export function requestNewVariant(generationId: string): Promise<{ generationId: string }> {
  return apiPost<{ generationId: string }>(`/api/generations/${generationId}/variants`);
}
