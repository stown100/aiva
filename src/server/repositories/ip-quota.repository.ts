import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

/** Atomic spend via the consume_ip_quota() DB function; false = the IP hit the cap. */
export async function consumeIpQuota(ipHash: string, limit: number): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc("consume_ip_quota", {
    p_ip_hash: ipHash,
    p_limit: limit,
  });

  if (error) throw new Error(`consume_ip_quota failed: ${error.message}`);
  return data === true;
}

export async function refundIpQuota(ipHash: string): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("refund_ip_quota", { p_ip_hash: ipHash });

  if (error) throw new Error(`refund_ip_quota failed: ${error.message}`);
}
