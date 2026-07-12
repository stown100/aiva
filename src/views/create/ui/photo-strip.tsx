"use client";

import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import type { UploadedPhoto } from "@/features/upload-photo";
import { Button } from "@/shared/ui/button";

interface PhotoStripProps {
  photo: UploadedPhoto;
  onChangePhoto: () => void;
}

/** Compact photo summary shown once the flow moves on to style selection. */
export function PhotoStrip({ photo, onChangePhoto }: PhotoStripProps) {
  const t = useTranslations("create.upload");

  return (
    <div className="flex items-center gap-3 rounded-2xl border p-2 pr-3">
      <Image
        src={photo.previewUrl}
        alt={t("previewAlt")}
        width={56}
        height={56}
        unoptimized
        className="size-14 rounded-xl object-cover"
      />
      <p className="flex-1 truncate text-sm font-medium">{t("photoReady")}</p>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onChangePhoto}>
        <RefreshCw aria-hidden />
        {t("changePhoto")}
      </Button>
    </div>
  );
}
