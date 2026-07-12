"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { STYLE_CATEGORIES, useStyles, type StyleCategory } from "@/entities/style";
import { SelectableStyleCard } from "@/features/select-style";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type CategoryFilter = StyleCategory | "all";

interface StyleGalleryProps {
  selectedStyleId: string | null;
  onSelect: (styleId: string) => void;
}

export function StyleGallery({ selectedStyleId, onSelect }: StyleGalleryProps) {
  const t = useTranslations();
  const { styles, status, retry } = useStyles();
  const [category, setCategory] = useState<CategoryFilter>("all");

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">{t("errors.internal")}</p>
        <Button variant="outline" onClick={retry}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  const visibleStyles =
    category === "all" ? styles : styles.filter((style) => style.category === category);

  return (
    <div>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {(["all", ...STYLE_CATEGORIES] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === value
                ? "border-transparent bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "all" ? t("styles.categories.all") : t(`styles.categories.${value}`)}
          </button>
        ))}
      </div>

      {status === "loading" ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" aria-hidden />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleStyles.map((style) => (
            <SelectableStyleCard
              key={style.id}
              styleId={style.id}
              name={t(`styles.items.${style.id}.name`)}
              description={t(`styles.items.${style.id}.description`)}
              previewUrl={style.previewUrl}
              isSelected={style.id === selectedStyleId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
