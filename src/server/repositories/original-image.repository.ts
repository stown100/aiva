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
