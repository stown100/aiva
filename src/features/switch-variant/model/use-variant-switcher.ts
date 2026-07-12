"use client";

import { useState } from "react";

import type { GenerationVariant } from "@/entities/generation";

interface UseVariantSwitcherResult {
  active: GenerationVariant | null;
  select: (variantId: string) => void;
  /** Jump back to "latest" — called before regenerating so the new version shows up. */
  reset: () => void;
}

/**
 * Derived selection: an explicit user choice wins while it exists, otherwise
 * the latest variant is shown — so a fresh regeneration appears automatically
 * unless the user pinned an older version afterwards.
 */
export function useVariantSwitcher(variants: GenerationVariant[]): UseVariantSwitcherResult {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const active = variants.find((variant) => variant.id === selectedId) ?? variants.at(-1) ?? null;

  return {
    active,
    select: setSelectedId,
    reset: () => setSelectedId(null),
  };
}
