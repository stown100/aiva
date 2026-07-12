import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

export type GenerationDbStatus = "pending" | "processing" | "completed" | "failed";

export interface GenerationRecord {
  id: string;
  user_id: string;
  original_image_id: string;
  style_id: string;
  prompt_version: number;
  status: GenerationDbStatus;
  error_code: string | null;
  created_at: string;
}

interface InsertGenerationInput {
  userId: string;
  originalImageId: string;
  styleId: string;
  promptVersion: number;
}

export async function insertGeneration(input: InsertGenerationInput): Promise<GenerationRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from("generations")
    .insert({
      user_id: input.userId,
      original_image_id: input.originalImageId,
      style_id: input.styleId,
      prompt_version: input.promptVersion,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) throw new Error(`generations insert failed: ${error?.message}`);
  return data;
}

export async function findGenerationById(id: string): Promise<GenerationRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("generations")
    .select()
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`generations select failed: ${error.message}`);
  return data;
}

export async function findGenerationForUser(
  id: string,
  userId: string,
): Promise<GenerationRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("generations")
    .select()
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`generations select failed: ${error.message}`);
  return data;
}

export async function listGenerationsByUser(
  userId: string,
  limit: number,
): Promise<GenerationRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("generations")
    .select()
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`generations select failed: ${error.message}`);
  return data ?? [];
}

export async function updateGenerationStatus(
  id: string,
  status: GenerationDbStatus,
  errorCode: string | null = null,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("generations")
    .update({ status, error_code: errorCode })
    .eq("id", id);

  if (error) throw new Error(`generations update failed: ${error.message}`);
}
