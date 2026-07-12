import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

export interface PublicStyleRecord {
  id: string;
  category: string;
  preview_url: string | null;
  sort_order: number;
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
