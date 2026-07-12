import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

/** Sign-in prompt shown on protected pages to unauthenticated visitors. */
export function AuthGate() {
  const t = useTranslations("authGate");

  return (
    <Card className="mx-auto w-full max-w-sm text-center">
      <CardContent className="flex flex-col items-center pt-6">
        <span className="bg-brand-gradient flex size-14 items-center justify-center rounded-2xl text-white shadow-md">
          <Sparkles className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        <Button
          className="bg-brand-gradient mt-6 w-full border-0 text-white"
          render={<Link href={ROUTES.auth} />}
        >
          {t("cta")}
        </Button>
      </CardContent>
    </Card>
  );
}
