import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

export function AppHeader() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <span className="bg-brand-gradient flex size-7 items-center justify-center rounded-lg text-white">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight">{t("appName")}</span>
        </Link>

        <Button
          size="sm"
          className="bg-brand-gradient border-0 text-white shadow-md"
          render={<Link href={ROUTES.create} />}
        >
          {t("tryForFree")}
        </Button>
      </div>
    </header>
  );
}
