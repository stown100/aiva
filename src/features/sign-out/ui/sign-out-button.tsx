"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/ui/button";

import { useSignOut } from "../model/use-sign-out";

interface SignOutButtonProps {
  onSignedOut?: () => void;
}

/** Labeled sign-out button for settings pages; the header uses the user menu. */
export function SignOutButton({ onSignedOut }: SignOutButtonProps) {
  const t = useTranslations("common");
  const signOut = useSignOut({ onSignedOut });

  return (
    <Button variant="outline" className="gap-2" onClick={() => void signOut()}>
      <LogOut aria-hidden />
      {t("signOut")}
    </Button>
  );
}
