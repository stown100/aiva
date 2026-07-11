import Image from "next/image";

import { cn } from "@/shared/lib/utils";

import {
  STYLE_EMOJIS,
  STYLE_FALLBACK_GRADIENT,
  STYLE_PLACEHOLDER_GRADIENTS,
} from "../constants";
import type { StyleId } from "../types";

interface StylePreviewProps {
  styleId: string;
  previewUrl?: string | null;
  alt: string;
  className?: string;
}

/**
 * Visual of a style: the real preview image when available, otherwise a
 * branded gradient placeholder.
 */
export function StylePreview({ styleId, previewUrl, alt, className }: StylePreviewProps) {
  if (previewUrl) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={previewUrl} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
      </div>
    );
  }

  const gradient = STYLE_PLACEHOLDER_GRADIENTS[styleId as StyleId] ?? STYLE_FALLBACK_GRADIENT;
  const emoji = STYLE_EMOJIS[styleId as StyleId] ?? "🖼️";

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ backgroundImage: gradient }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
      <span className="text-5xl drop-shadow-lg" aria-hidden>
        {emoji}
      </span>
    </div>
  );
}
