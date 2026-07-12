"use client";

import Image from "next/image";

import { cn } from "@/shared/lib/utils";

interface VariantThumbnailProps {
  imageUrl: string;
  alt: string;
  isActive: boolean;
  onSelect: () => void;
}

export function VariantThumbnail({ imageUrl, alt, isActive, onSelect }: VariantThumbnailProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={cn(
        "relative size-16 shrink-0 snap-start overflow-hidden rounded-xl border transition-all",
        isActive ? "ring-3 ring-primary" : "opacity-70 hover:opacity-100",
      )}
    >
      <Image src={imageUrl} alt={alt} fill unoptimized className="object-cover" sizes="64px" />
    </button>
  );
}
