"use client";

import { motion } from "framer-motion";
import { Palette, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import type { GenerationDetail } from "@/entities/generation";
import { Button } from "@/shared/ui/button";

interface ResultPreviewProps {
  generation: GenerationDetail;
  styleName: string;
  onRegenerate: () => void;
  onChangeStyle: () => void;
}

/**
 * Minimal result screen; the full result-viewer widget with the version
 * slider and download/share actions lands in build step 8.
 */
export function ResultPreview({
  generation,
  styleName,
  onRegenerate,
  onChangeStyle,
}: ResultPreviewProps) {
  const t = useTranslations("create.result");
  const latestVariant = generation.variants.at(-1);

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-muted-foreground">{styleName}</p>

      {latestVariant && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-6 w-full max-w-sm overflow-hidden rounded-3xl border shadow-xl"
        >
          <Image
            src={latestVariant.imageUrl}
            alt={t("resultAlt", { style: styleName })}
            width={1024}
            height={1024}
            unoptimized
            className="h-auto w-full"
          />
        </motion.div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button className="bg-brand-gradient gap-2 border-0 text-white" onClick={onRegenerate}>
          <RefreshCw aria-hidden />
          {t("regenerate")}
        </Button>
        <Button variant="outline" className="gap-2" onClick={onChangeStyle}>
          <Palette aria-hidden />
          {t("changeStyle")}
        </Button>
      </div>
    </div>
  );
}
