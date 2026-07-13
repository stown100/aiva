import { StyleCategory } from "@/shared/types";

import type { StyleId } from "./types";

/**
 * Static catalog used for marketing surfaces (landing) and as a visual
 * fallback until a style has a real preview image. The source of truth for
 * generation is the `styles` table in the database.
 */
export const STYLE_CATALOG: Record<StyleId, { category: StyleCategory }> = {
  "anime-dream": { category: StyleCategory.TRENDING },
  "pixar-character": { category: StyleCategory.TRENDING },
  "cinematic-movie": { category: StyleCategory.TRENDING },
  "luxury-magazine": { category: StyleCategory.TRENDING },
  "vintage-film": { category: StyleCategory.TRENDING },
  cyberpunk: { category: StyleCategory.CREATIVE },
  "fantasy-hero": { category: StyleCategory.CREATIVE },
  "comic-book": { category: StyleCategory.CREATIVE },
  watercolor: { category: StyleCategory.CREATIVE },
  "oil-painting": { category: StyleCategory.CREATIVE },
  "linkedin-portrait": { category: StyleCategory.PROFESSIONAL },
  "startup-founder": { category: StyleCategory.PROFESSIONAL },
  "influencer-style": { category: StyleCategory.PROFESSIONAL },
  "retro-90s": { category: StyleCategory.FUN },
  "game-character": { category: StyleCategory.FUN },
};

export const STYLE_PLACEHOLDER_GRADIENTS: Record<StyleId, string> = {
  "anime-dream": "linear-gradient(135deg, #ff8fab, #a78bfa)",
  "pixar-character": "linear-gradient(135deg, #60a5fa, #fbbf24)",
  "cinematic-movie": "linear-gradient(135deg, #1e293b, #7dd3fc)",
  "luxury-magazine": "linear-gradient(135deg, #292524, #d4af37)",
  "vintage-film": "linear-gradient(135deg, #d6b28a, #7c5c3e)",
  cyberpunk: "linear-gradient(135deg, #22d3ee, #e879f9)",
  "fantasy-hero": "linear-gradient(135deg, #34d399, #312e81)",
  "comic-book": "linear-gradient(135deg, #f59e0b, #ef4444)",
  watercolor: "linear-gradient(135deg, #a5f3fc, #f9a8d4)",
  "oil-painting": "linear-gradient(135deg, #b45309, #57320f)",
  "linkedin-portrait": "linear-gradient(135deg, #38bdf8, #1e3a5f)",
  "startup-founder": "linear-gradient(135deg, #64748b, #0ea5e9)",
  "influencer-style": "linear-gradient(135deg, #fb7185, #fbbf24)",
  "retro-90s": "linear-gradient(135deg, #f472b6, #38bdf8)",
  "game-character": "linear-gradient(135deg, #8b5cf6, #22c55e)",
};

export const STYLE_EMOJIS: Record<StyleId, string> = {
  "anime-dream": "🌸",
  "pixar-character": "🧸",
  "cinematic-movie": "🎬",
  "luxury-magazine": "💎",
  "vintage-film": "📷",
  cyberpunk: "🌆",
  "fantasy-hero": "🐉",
  "comic-book": "💥",
  watercolor: "🎨",
  "oil-painting": "🖼️",
  "linkedin-portrait": "💼",
  "startup-founder": "🚀",
  "influencer-style": "✨",
  "retro-90s": "📼",
  "game-character": "🎮",
};

export const STYLE_FALLBACK_GRADIENT = "linear-gradient(135deg, #a78bfa, #f472b6)";
