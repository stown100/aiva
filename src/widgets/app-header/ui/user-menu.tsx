"use client";

import { LogOut, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import type { UserProfile } from "@/entities/user";
import { useSignOut } from "@/features/sign-out";
import { ROUTES } from "@/shared/config";
import { useRouter } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface UserMenuProps {
  profile: UserProfile;
  onSignedOut: () => void;
}

/**
 * Avatar in the header that opens the account menu: the user row navigates
 * to the profile page, sign-out sits at the bottom.
 */
export function UserMenu({ profile, onSignedOut }: UserMenuProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const signOut = useSignOut({ onSignedOut });

  const initial = profile.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("account")}
            title={t("account")}
            className="rounded-full"
          >
            <span className="bg-brand-gradient flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white">
              {initial}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          className="cursor-pointer py-2"
          onClick={() => router.push(ROUTES.account)}
        >
          <UserRound aria-hidden />
          <span className="block truncate text-sm font-medium">{profile.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={() => void signOut()}
        >
          <LogOut aria-hidden />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
