"use client";

import { Check, Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { updateMyLanguage, useMe } from "@/entities/user";
import { LOCALES, usePathname, useRouter, type AppLocale } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { LANGUAGES } from "../constants";

interface LanguageSwitcherProps {
  /** "icon" — compact globe for the header; "labeled" — shows the current language name. */
  appearance?: "icon" | "labeled";
}

export function LanguageSwitcher({ appearance = "icon" }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useMe();

  const handleSelect = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    // The cookie set by the i18n middleware keeps the choice for guests;
    // signed-in users also get it saved to their profile.
    if (status === "authenticated") {
      void updateMyLanguage(nextLocale).catch(() => {});
    }
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          appearance === "labeled" ? (
            <Button variant="outline" className="gap-2">
              <span aria-hidden>{LANGUAGES[locale].flag}</span>
              {LANGUAGES[locale].label}
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm" aria-label={LANGUAGES[locale].label}>
              <Globe aria-hidden />
            </Button>
          )
        }
      />
      <DropdownMenuContent align="end">
        {LOCALES.map((value) => (
          <DropdownMenuItem key={value} onClick={() => handleSelect(value)}>
            <span aria-hidden>{LANGUAGES[value].flag}</span>
            <span className="flex-1">{LANGUAGES[value].label}</span>
            {value === locale && <Check className="size-4 text-primary" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
