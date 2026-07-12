import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

export interface VariantRecord {
  id: string;
  generation_id: string;
  version_number: number;
  storage_path: string;
  created_at: string;
}

export async function listVariants(generationId: string): Promise<VariantRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("generation_variants")
    .select()
    .eq("generation_id", generationId)
    .order("version_number", { ascending: true });

  if (error) throw new Error(`generation_variants select failed: ${error.message}`);
  return data ?? [];
}

/** Variants for a batch of generations in one query (history thumbnails). */
export async function listVariantsForGenerations(
  generationIds: string[],
): Promise<VariantRecord[]> {
  if (generationIds.length === 0) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("generation_variants")
    .select()
    .in("generation_id", generationIds)
    .order("version_number", { ascending: true });

  if (error) throw new Error(`generation_variants select failed: ${error.message}`);
  return data ?? [];
}

export async function getNextVersionNumber(generationId: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("generation_variants")
    .select("version_number")
    .eq("generation_id", generationId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`generation_variants select failed: ${error.message}`);
  return (data?.version_number ?? 0) + 1;
}

interface InsertVariantInput {
  generationId: string;
  versionNumber: number;
  storagePath: string;
}

export async function insertVariant(input: InsertVariantInput): Promise<VariantRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from("generation_variants")
    .insert({
      generation_id: input.generationId,
      version_number: input.versionNumber,
      storage_path: input.storagePath,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`generation_variants insert failed: ${error?.message}`);
  return data;
}
