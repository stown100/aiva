"use client";

import { Check, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { track } from "@/shared/analytics";
import { Button } from "@/shared/ui/button";

interface ShareResultButtonProps {
  imageUrl: string;
  fileName: string;
  styleId: string;
  shareTitle: string;
}

export function ShareResultButton({
  imageUrl,
  fileName,
  styleId,
  shareTitle,
}: ShareResultButtonProps) {
  const t = useTranslations("create.result");
  const [isCopied, setIsCopied] = useState(false);

  const shareAsFile = async (): Promise<boolean> => {
    if (typeof navigator.share !== "function") return false;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: shareTitle });
        return true;
      }
      await navigator.share({ title: shareTitle, url: imageUrl });
      return true;
    } catch (error) {
      // The user closing the share sheet is not a failure.
      return error instanceof DOMException && error.name === "AbortError";
    }
  };

  const handleShare = async () => {
    track({ name: "share_clicked", props: { styleId } });

    if (await shareAsFile()) return;

    // Desktop fallback: copy the (time-limited) link.
    await navigator.clipboard.writeText(imageUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button variant="outline" className="gap-2" onClick={() => void handleShare()}>
      {isCopied ? <Check className="text-primary" aria-hidden /> : <Share2 aria-hidden />}
      {isCopied ? t("copied") : t("share")}
    </Button>
  );
}
