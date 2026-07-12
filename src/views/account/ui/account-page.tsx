"use client";

import { useFormatter, useTranslations } from "next-intl";

import { useMe } from "@/entities/user";
import { SignOutButton } from "@/features/sign-out";
import { LanguageSwitcher } from "@/features/switch-language";
import { FREE_MONTHLY_CREDITS } from "@/shared/config";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { AppHeader } from "@/widgets/app-header";
import { AuthGate } from "@/widgets/auth-gate";

export function AccountPage() {
  const t = useTranslations();
  const format = useFormatter();
  const { profile, status, markGuest } = useMe();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        {status === "loading" && (
          <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />
        )}

        {status === "guest" && <AuthGate />}

        {profile && (
          <section>
            <h1 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
              {t("account.title")}
            </h1>

            <Card className="mt-8">
              <CardContent className="divide-y">
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-muted-foreground">{t("account.email")}</span>
                  <span className="truncate text-sm font-medium">{profile.email}</span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-muted-foreground">{t("account.plan")}</span>
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {profile.subscriptionStatus === "free"
                        ? t("account.planFree")
                        : profile.subscriptionStatus}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{t("account.proSoon")}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-muted-foreground">{t("account.credits")}</span>
                  <span className="text-sm font-medium">
                    ✨ {t("account.creditsValue", {
                      credits: profile.credits,
                      total: FREE_MONTHLY_CREDITS,
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-muted-foreground">{t("account.creditsReset")}</span>
                  <span className="text-sm font-medium">
                    {format.dateTime(new Date(profile.creditsResetAt), { dateStyle: "long" })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-muted-foreground">{t("account.language")}</span>
                  <LanguageSwitcher appearance="labeled" />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <SignOutButton appearance="labeled" onSignedOut={markGuest} />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
