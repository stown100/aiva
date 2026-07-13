import type { GenerationStatus } from "@/shared/types";

export interface GenerationVariant {
  id: string;
  versionNumber: number;
  imageUrl: string;
}

export interface HistoryItem {
  id: string;
  styleId: string;
  createdAt: string;
  previewUrl: string;
  versionsCount: number;
}

export interface GenerationDetail {
  id: string;
  styleId: string;
  status: GenerationStatus;
  errorCode: string | null;
  variants: GenerationVariant[];
}
