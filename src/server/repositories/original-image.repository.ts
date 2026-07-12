import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

export interface OriginalImageRecord {
  id: string;
  user_id: string;
  storage_path: string;
  format: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
}

export async function findOriginalImageForUser(
  id: string,
  userId: string,
): Promise<OriginalImageRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("original_images")
    .select("id, user_id, storage_path, format, width, height, size_bytes")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`original_images select failed: ${error.message}`);
  return data;
}

export async function findOriginalImageById(id: string): Promise<OriginalImageRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("original_images")
    .select("id, user_id, storage_path, format, width, height, size_bytes")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`original_images select failed: ${error.message}`);
  return data;
}

interface InsertOriginalImageInput {
  userId: string;
  storagePath: string;
  format: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export async function insertOriginalImage(
  input: InsertOriginalImageInput,
): Promise<OriginalImageRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from("original_images")
    .insert({
      user_id: input.userId,
      storage_path: input.storagePath,
      format: input.format,
      width: input.width,
      height: input.height,
      size_bytes: input.sizeBytes,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`original_images insert failed: ${error?.message}`);
  return data;
}
