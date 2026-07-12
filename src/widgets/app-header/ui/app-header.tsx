import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

import { HeaderUserArea } from "./header-user-area";

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

        <HeaderUserArea />
      </div>
    </header>
  );
}
