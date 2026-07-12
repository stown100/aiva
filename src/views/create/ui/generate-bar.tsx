"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/ui/button";

interface GenerateBarProps {
  styleName: string;
}

/** Sticky action bar; the CTA is wired to the generation flow in step 7. */
export function GenerateBar({ styleName }: GenerateBarProps) {
  const t = useTranslations("create.generate");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t("selectedLabel")}</p>
          <p className="truncate font-semibold">{styleName}</p>
        </div>
        <Button
          size="lg"
          className="bg-brand-gradient h-11 shrink-0 gap-2 border-0 px-6 text-white shadow-lg"
          disabled
          title={t("soon")}
        >
          <Sparkles aria-hidden />
          {t("cta")}
        </Button>
      </div>
    </div>
  );
}
