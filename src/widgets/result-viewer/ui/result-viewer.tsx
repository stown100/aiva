"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Palette, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import type { GenerationDetail } from "@/entities/generation";
import { VariantThumbnail } from "@/entities/variant";
import { DownloadResultButton } from "@/features/download-result";
import { ShareResultButton } from "@/features/share-result";
import { useVariantSwitcher } from "@/features/switch-variant";
import { Button } from "@/shared/ui/button";

interface ResultViewerProps {
  generation: GenerationDetail;
  styleName: string;
  onRegenerate: () => void;
  onChangeStyle: () => void;
}

export function ResultViewer({
  generation,
  styleName,
  onRegenerate,
  onChangeStyle,
}: ResultViewerProps) {
  const t = useTranslations("create.result");
  const { active, select, reset } = useVariantSwitcher(generation.variants);

  if (!active) return null;

  const fileName = `aiva-${generation.styleId}-v${active.versionNumber}.png`;
  const resultAlt = t("resultAlt", { style: styleName });

  const handleRegenerate = () => {
    reset();
    onRegenerate();
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-muted-foreground">
        {styleName}
        {generation.variants.length > 1 && (
          <>
            {" · "}
            {t("versionLabel", {
              current: active.versionNumber,
              total: generation.variants.length,
            })}
          </>
        )}
      </p>

      <div className="relative mt-6 w-full max-w-sm">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-3xl border shadow-xl"
          >
            <Image
              src={active.imageUrl}
              alt={resultAlt}
              width={1024}
              height={1024}
              unoptimized
              priority
              className="h-auto w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {generation.variants.length > 1 && (
        <div className="scrollbar-none mt-4 flex w-full max-w-sm snap-x gap-2 overflow-x-auto px-1 py-1">
          {generation.variants.map((variant) => (
            <VariantThumbnail
              key={variant.id}
              imageUrl={variant.imageUrl}
              alt={t("versionLabel", {
                current: variant.versionNumber,
                total: generation.variants.length,
              })}
              isActive={variant.id === active.id}
              onSelect={() => select(variant.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
        <DownloadResultButton
          imageUrl={active.imageUrl}
          fileName={fileName}
          styleId={generation.styleId}
        />
        <ShareResultButton
          imageUrl={active.imageUrl}
          fileName={fileName}
          styleId={generation.styleId}
          shareTitle={resultAlt}
        />
        <Button variant="outline" className="gap-2" onClick={handleRegenerate}>
          <RefreshCw aria-hidden />
          {t("regenerate")}
        </Button>
        <Button variant="ghost" className="gap-2" onClick={onChangeStyle}>
          <Palette aria-hidden />
          {t("changeStyle")}
        </Button>
      </div>
    </div>
  );
}
