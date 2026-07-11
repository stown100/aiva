import { cn } from "@/shared/lib/utils";

import { StylePreview } from "./style-preview";

interface StyleCardProps {
  styleId: string;
  name: string;
  description: string;
  previewUrl?: string | null;
  className?: string;
}

/**
 * Presentational style card: preview with the name and an emotional
 * description overlaid at the bottom. Selection behavior is added by
 * features that wrap this card.
 */
export function StyleCard({ styleId, name, description, previewUrl, className }: StyleCardProps) {
  return (
    <div className={cn("group relative aspect-[3/4] overflow-hidden rounded-2xl", className)}>
      <StylePreview
        styleId={styleId}
        previewUrl={previewUrl}
        alt={name}
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3 pt-10">
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-white/75">{description}</p>
      </div>
    </div>
  );
}
