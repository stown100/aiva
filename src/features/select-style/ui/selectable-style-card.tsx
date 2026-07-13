"use client";

import { Check } from "lucide-react";
import { memo } from "react";

import { StyleCard } from "@/entities/style";
import { cn } from "@/shared/lib/utils";

interface SelectableStyleCardProps {
  styleId: string;
  name: string;
  description: string;
  previewUrl?: string | null;
  isSelected: boolean;
  onSelect: (styleId: string) => void;
}

// Memoized: selecting a style re-renders only the two affected cards of the
// grid, not all fifteen image cards.
export const SelectableStyleCard = memo(function SelectableStyleCard({
  styleId,
  name,
  description,
  previewUrl,
  isSelected,
  onSelect,
}: SelectableStyleCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(styleId)}
      className={cn(
        "relative rounded-2xl text-left outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
        isSelected ? "ring-3 ring-primary" : "hover:scale-[1.02] active:scale-[0.99]",
      )}
    >
      <StyleCard styleId={styleId} name={name} description={description} previewUrl={previewUrl} />
      {isSelected && (
        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Check className="size-4" aria-hidden />
        </span>
      )}
    </button>
  );
});
