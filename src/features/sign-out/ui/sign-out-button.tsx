"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { getSupabaseBrowser } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useRouter } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";

interface SignOutButtonProps {
  onSignedOut?: () => void;
}

export function SignOutButton({ onSignedOut }: SignOutButtonProps) {
  const t = useTranslations("common");
  const router = useRouter();

  const handleSignOut = async () => {
    await getSupabaseBrowser().auth.signOut();
    onSignedOut?.();
    router.push(ROUTES.home);
    router.refresh();
  };

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
