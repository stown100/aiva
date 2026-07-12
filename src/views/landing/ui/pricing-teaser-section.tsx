"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { track } from "@/shared/analytics";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

const FREE_FEATURES = ["credits", "styles", "quality"] as const;
const PRO_FEATURES = ["unlimited", "newStyles", "speed"] as const;

export function PricingTeaserSection() {
  const t = useTranslations("landing.pricing");

  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-4xl px-4 py-16 md:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card className="relative overflow-hidden border-primary/40 shadow-lg">
            <div className="bg-brand-gradient absolute inset-x-0 top-0 h-1" />
            <CardHeader>
              <CardTitle className="text-xl">{t("free.name")}</CardTitle>
              <p>
                <span className="text-4xl font-extrabold">{t("free.price")}</span>{" "}
                <span className="text-sm text-muted-foreground">{t("free.period")}</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-primary" aria-hidden />
                    {t(`free.features.${feature}`)}
                  </li>
                ))}
              </ul>
              <Button
                className="bg-brand-gradient mt-6 w-full border-0 text-white"
                render={<Link href={ROUTES.create} />}
              >
                {t("free.cta")}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-dashed transition-colors hover:border-primary/40"
            onClick={() => track({ name: "subscription_clicked" })}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {t("pro.name")}
                <Badge variant="secondary" className="rounded-full">
                  {t("pro.badge")}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 shrink-0" aria-hidden />
                    {t(`pro.features.${feature}`)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
