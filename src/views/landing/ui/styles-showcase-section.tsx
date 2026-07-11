import { useTranslations } from "next-intl";

import { STYLE_CATALOG, StyleCard } from "@/entities/style";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

import { SHOWCASE_STYLE_IDS } from "../constants";

export function StylesShowcaseSection() {
  const t = useTranslations();

  return (
    <section id="styles" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("landing.showcase.title")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("landing.showcase.subtitle")}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
        {SHOWCASE_STYLE_IDS.map((styleId) => (
          <div key={styleId} className="relative">
            <StyleCard
              styleId={styleId}
              name={t(`styles.items.${styleId}.name`)}
              description={t(`styles.items.${styleId}.description`)}
            />
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 rounded-full bg-white/85 text-[10px] text-foreground backdrop-blur-sm dark:bg-black/60 dark:text-white"
            >
              {t(`styles.categories.${STYLE_CATALOG[styleId].category}`)}
            </Badge>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button
          size="lg"
          variant="outline"
          className="h-12 px-8"
          render={<Link href={ROUTES.create} />}
        >
          {t("landing.showcase.cta")}
        </Button>
      </div>
    </section>
  );
}
