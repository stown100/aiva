export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface GenerationVariant {
  id: string;
  versionNumber: number;
  imageUrl: string;
}

export interface GenerationDetail {
  id: string;
  styleId: string;
  status: GenerationStatus;
  errorCode: string | null;
  variants: GenerationVariant[];
}
