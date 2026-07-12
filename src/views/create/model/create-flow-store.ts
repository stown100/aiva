"use client";

import { create } from "zustand";

import type { UploadedPhoto } from "@/features/upload-photo";

/**
 * Client state of the creation flow. Grows into the full generation state
 * machine (style selection, generating, result) in later build steps.
 */
interface CreateFlowState {
  photo: UploadedPhoto | null;
  setPhoto: (photo: UploadedPhoto | null) => void;
}

export const useCreateFlowStore = create<CreateFlowState>((set) => ({
  photo: null,
  setPhoto: (photo) => set({ photo }),
}));
