import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";
import { AppHeader } from "@/widgets/app-header";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <span className="bg-brand-gradient flex size-14 items-center justify-center rounded-2xl text-white shadow-md">
          <Compass className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">{t("description")}</p>
        <Button
          className="bg-brand-gradient mt-8 border-0 text-white"
          render={<Link href={ROUTES.home} />}
        >
          {t("cta")}
        </Button>
      </main>
    </>
  );
}
