import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations();

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="bg-brand-gradient flex size-6 items-center justify-center rounded-md text-white">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <span className="font-semibold">{t("common.appName")}</span>
          <span className="text-sm text-muted-foreground">— {t("common.tagline")}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("landing.footer.rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
