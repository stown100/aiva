import { Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { AppHeader } from "@/widgets/app-header";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

/**
 * Temporary placeholder — the real creation flow (upload → style → generate)
 * is implemented in later build steps.
 */
export function CreatePage() {
  const t = useTranslations();

  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="bg-brand-gradient flex size-16 items-center justify-center rounded-2xl text-white shadow-lg">
          <Wand2 className="size-7" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold">{t("createPlaceholder.title")}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">{t("createPlaceholder.description")}</p>
        <Button variant="outline" className="mt-8" render={<Link href={ROUTES.home} />}>
          {t("common.backHome")}
        </Button>
      </main>
    </>
  );
}
