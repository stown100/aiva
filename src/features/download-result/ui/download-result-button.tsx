"use client";

import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { track } from "@/shared/analytics";
import { Button } from "@/shared/ui/button";

interface DownloadResultButtonProps {
  imageUrl: string;
  fileName: string;
  styleId: string;
}

export function DownloadResultButton({ imageUrl, fileName, styleId }: DownloadResultButtonProps) {
  const t = useTranslations("create.result");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    track({ name: "download_clicked", props: { styleId } });
    setIsDownloading(true);
    try {
      // Signed URLs are cross-origin, so the `download` attribute alone is
      // ignored — fetch to a blob first to force a real file download.
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      className="bg-brand-gradient gap-2 border-0 text-white"
      disabled={isDownloading}
      onClick={() => void handleDownload()}
    >
      {isDownloading ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
      {t("download")}
    </Button>
  );
}
