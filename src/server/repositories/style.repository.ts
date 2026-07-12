import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

export interface PublicStyleRecord {
  id: string;
  category: string;
  preview_url: string | null;
  sort_order: number;
}

export interface StylePromptRecord {
  id: string;
  prompt_template: string;
  prompt_version: number;
}

/** Full style row including the prompt — server-side use only. */
export async function findStyleWithPrompt(styleId: string): Promise<StylePromptRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("styles")
    .select("id, prompt_template, prompt_version")
    .eq("id", styleId)
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(`styles select failed: ${error.message}`);
  return data;
}

/** Reads the public view — prompt columns are not part of it by design. */
export async function listActiveStyles(): Promise<PublicStyleRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("styles_public")
    .select("id, category, preview_url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`styles_public select failed: ${error.message}`);
  return data ?? [];
}
