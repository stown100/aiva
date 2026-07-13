import "server-only";

import { StyleCategory } from "@/shared/types";

import { listActiveStyles } from "../repositories/style.repository";

const CATEGORY_ORDER: string[] = Object.values(StyleCategory);

export interface StyleSummaryDto {
  id: string;
  category: string;
  previewUrl: string | null;
}

export async function getStyleCatalog(): Promise<StyleSummaryDto[]> {
  const records = await listActiveStyles();

  return records
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
        a.sort_order - b.sort_order,
    )
    .map((record) => ({
      id: record.id,
      category: record.category,
      previewUrl: record.preview_url,
    }));
}
