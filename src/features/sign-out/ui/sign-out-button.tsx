"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { getSupabaseBrowser } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useRouter } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";

interface SignOutButtonProps {
  onSignedOut?: () => void;
  /** "icon" for the compact header button, "labeled" for settings pages. */
  appearance?: "icon" | "labeled";
}

export function SignOutButton({ onSignedOut, appearance = "icon" }: SignOutButtonProps) {
  const t = useTranslations("common");
  const router = useRouter();

  const handleSignOut = async () => {
    await getSupabaseBrowser().auth.signOut();
    onSignedOut?.();
    router.push(ROUTES.home);
    router.refresh();
  };

  if (appearance === "labeled") {
    return (
      <Button variant="outline" className="gap-2" onClick={() => void handleSignOut()}>
        <LogOut aria-hidden />
        {t("signOut")}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t("signOut")}
      title={t("signOut")}
      onClick={() => void handleSignOut()}
    >
      <LogOut aria-hidden />
    </Button>
  );
}
