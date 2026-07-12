import type { AppLocale } from "@/shared/i18n";

/** Native names — a language must be recognizable in any current UI language. */
export const LANGUAGES: Record<AppLocale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  ru: { label: "Русский", flag: "🇷🇺" },
  tr: { label: "Türkçe", flag: "🇹🇷" },
  es: { label: "Español", flag: "🇪🇸" },
};
