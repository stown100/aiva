"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

import type { UploadStatus } from "../model/use-upload-photo";

const INPUT_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif";

interface PhotoDropZoneProps {
  status: UploadStatus;
  errorCode: string | null;
  onFileSelected: (file: File) => void;
}

export function PhotoDropZone({ status, errorCode, onFileSelected }: PhotoDropZoneProps) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isUploading = status === "uploading";

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && !isUploading) onFileSelected(file);
  };

  return (
    <div>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          isUploading && "pointer-events-none opacity-80",
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
            <p className="font-medium">{t("create.upload.uploading")}</p>
          </>
        ) : (
          <>
            <span className="bg-brand-gradient flex size-14 items-center justify-center rounded-2xl text-white shadow-md">
              <ImagePlus className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-base font-semibold">{t("create.upload.title")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("create.upload.hint")}</p>
            </div>
            <p className="text-xs text-muted-foreground">{t("create.upload.formats")}</p>
          </>
        )}
      </button>

      {status === "error" && errorCode && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {t(`errors.${errorCode}`)}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={INPUT_ACCEPT}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
