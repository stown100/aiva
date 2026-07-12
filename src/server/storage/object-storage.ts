import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

export const STORAGE_BUCKETS = {
  originals: "originals",
  results: "results",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function uploadObject(
  bucket: StorageBucket,
  path: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin().storage.from(bucket).upload(path, body, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`storage upload failed (${bucket}/${path}): ${error.message}`);
}

export async function downloadObject(bucket: StorageBucket, path: string): Promise<Buffer> {
  const { data, error } = await getSupabaseAdmin().storage.from(bucket).download(path);
  if (error || !data) {
    throw new Error(`storage download failed (${bucket}/${path}): ${error?.message}`);
  }
  return Buffer.from(await data.arrayBuffer());
}

export async function createSignedUrl(bucket: StorageBucket, path: string): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) {
    throw new Error(`signed url failed (${bucket}/${path}): ${error?.message}`);
  }
  return data.signedUrl;
}
