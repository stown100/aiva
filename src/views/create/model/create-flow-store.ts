"use client";

import { create } from "zustand";

import type { UploadedPhoto } from "@/features/upload-photo";

/**
 * Client state of the creation flow. Grows into the full generation state
 * machine (generating, result, versions) in later build steps.
 */
interface CreateFlowState {
  photo: UploadedPhoto | null;
  styleId: string | null;
  setPhoto: (photo: UploadedPhoto | null) => void;
  setStyle: (styleId: string) => void;
}

export const useCreateFlowStore = create<CreateFlowState>((set) => ({
  photo: null,
  styleId: null,
  setPhoto: (photo) => set({ photo }),
  setStyle: (styleId) => set({ styleId }),
}));
