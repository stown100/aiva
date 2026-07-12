"use client";

import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { PhotoDropZone, useUploadPhoto, type UploadedPhoto } from "@/features/upload-photo";
import { Button } from "@/shared/ui/button";

interface PhotoUploaderProps {
  photo: UploadedPhoto | null;
  onPhotoChange: (photo: UploadedPhoto | null) => void;
}

export function PhotoUploader({ photo, onPhotoChange }: PhotoUploaderProps) {
  const t = useTranslations("create.upload");
  const { status, errorCode, upload } = useUploadPhoto({ onUploaded: onPhotoChange });

  if (photo) {
    return (
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border shadow-lg">
        <Image
          src={photo.previewUrl}
          alt={t("previewAlt")}
          width={photo.width}
          height={photo.height}
          unoptimized
          className="h-auto w-full"
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 bg-white/90 text-foreground backdrop-blur-sm hover:bg-white dark:bg-black/60 dark:text-white"
            onClick={() => onPhotoChange(null)}
          >
            <RefreshCw aria-hidden />
            {t("changePhoto")}
          </Button>
        </div>
      </div>
    );
  }

  return <PhotoDropZone status={status} errorCode={errorCode} onFileSelected={(file) => void upload(file)} />;
}
