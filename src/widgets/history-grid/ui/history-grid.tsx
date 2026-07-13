"use client";

import { ImageOff, Layers } from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { fetchHistory, type HistoryItem } from "@/entities/generation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

enum HistoryStatus {
  LOADING = "loading",
  READY = "ready",
  ERROR = "error",
}

interface HistoryGridProps {
  onOpen: (generationId: string) => void;
}

export function HistoryGrid({ onOpen }: HistoryGridProps) {
  const t = useTranslations();
  const format = useFormatter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [status, setStatus] = useState<HistoryStatus>(HistoryStatus.LOADING);

  useEffect(() => {
    void fetchHistory()
      .then((history) => {
        setItems(history);
        setStatus(HistoryStatus.READY);
      })
      .catch(() => setStatus(HistoryStatus.ERROR));
  }, []);

  if (status === HistoryStatus.LOADING) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" aria-hidden />
        ))}
      </div>
    );
  }

  if (status === HistoryStatus.ERROR) {
    return <p className="py-12 text-center text-sm text-muted-foreground">{t("errors.internal")}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ImageOff className="size-6" aria-hidden />
        </span>
        <div>
          <p className="font-semibold">{t("history.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("history.emptyDescription")}</p>
        </div>
        <Button
          className="bg-brand-gradient border-0 text-white"
          render={<Link href={ROUTES.create} />}
        >
          {t("common.tryForFree")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen(item.id)}
          className="group relative aspect-[3/4] overflow-hidden rounded-2xl border text-left outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 hover:scale-[1.02]"
        >
          <Image
            src={item.previewUrl}
            alt={t(`styles.items.${item.styleId}.name`)}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          {item.versionsCount > 1 && (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 gap-1 rounded-full bg-black/55 text-white backdrop-blur-sm"
            >
              <Layers className="size-3" aria-hidden />
              {item.versionsCount}
            </Badge>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
            <p className="text-sm font-semibold text-white">
              {t(`styles.items.${item.styleId}.name`)}
            </p>
            <p className="text-xs text-white/70">
              {format.dateTime(new Date(item.createdAt), { dateStyle: "medium" })}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
