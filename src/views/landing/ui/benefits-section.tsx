import { Gem, ShieldCheck, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/shared/ui/card";

const BENEFITS = [
  { key: "simple", Icon: Wand2 },
  { key: "private", Icon: ShieldCheck },
  { key: "quality", Icon: Gem },
] as const;

export function BenefitsSection() {
  const t = useTranslations("landing.benefits");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {BENEFITS.map(({ key, Icon }) => (
          <Card key={key} className="border-muted">
            <CardContent className="pt-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t(`items.${key}.title`)}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(`items.${key}.description`)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
