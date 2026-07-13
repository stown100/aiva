import { StyleCategory } from "@/shared/types";

export const STYLE_CATEGORIES = Object.values(StyleCategory);

export const STYLE_IDS = [
  "anime-dream",
  "pixar-character",
  "cinematic-movie",
  "luxury-magazine",
  "vintage-film",
  "cyberpunk",
  "fantasy-hero",
  "comic-book",
  "watercolor",
  "oil-painting",
  "linkedin-portrait",
  "startup-founder",
  "influencer-style",
  "retro-90s",
  "game-character",
] as const;

export type StyleId = (typeof STYLE_IDS)[number];

export interface StyleSummary {
  id: string;
  category: StyleCategory;
  previewUrl: string | null;
}
