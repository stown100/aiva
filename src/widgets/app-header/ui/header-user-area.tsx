"use client";

import { History } from "lucide-react";
import { useTranslations } from "next-intl";

import { CreditsBadge, MeStatus, useMe } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

import { UserMenu } from "./user-menu";

export function HeaderUserArea() {
  const t = useTranslations("common");
  const { profile, status, markGuest } = useMe();

  if (status === MeStatus.LOADING) {
    return <div className="h-7 w-28 animate-pulse rounded-full bg-muted" aria-hidden />;
  }

  if (!profile) {
    return (
      <Button
        size="sm"
        className="bg-brand-gradient border-0 text-white shadow-md"
        render={<Link href={ROUTES.create} />}
      >
        {t("tryForFree")}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("history")}
        title={t("history")}
        render={<Link href={ROUTES.history} />}
      >
        <History aria-hidden />
      </Button>
      <Link href={ROUTES.account} aria-label={t("account")} title={t("account")}>
        <CreditsBadge
          credits={profile.credits}
          label={t("creditsLeft", { count: profile.credits })}
        />
      </Link>
      <UserMenu profile={profile} onSignedOut={markGuest} />
    </div>
  );
}
