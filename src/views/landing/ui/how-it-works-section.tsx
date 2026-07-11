import { Download, Palette, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS = [
  { key: "upload", Icon: Upload },
  { key: "style", Icon: Palette },
  { key: "result", Icon: Download },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map(({ key, Icon }, index) => (
            <div key={key} className="relative flex flex-col items-center text-center">
              <div className="bg-brand-gradient flex size-14 items-center justify-center rounded-2xl text-white shadow-lg">
                <Icon className="size-6" aria-hidden />
              </div>
              <span className="mt-4 text-sm font-medium text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 text-lg font-semibold">{t(`steps.${key}.title`)}</h3>
              <p className="mt-1.5 max-w-56 text-sm text-muted-foreground">
                {t(`steps.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
