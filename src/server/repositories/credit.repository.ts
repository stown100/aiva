import "server-only";

import { getSupabaseAdmin } from "../lib/supabase-admin";

/** Atomic spend via the consume_credit() DB function; false = no credits left. */
export async function consumeCredit(userId: string, generationId?: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc("consume_credit", {
    p_user_id: userId,
    p_generation_id: generationId ?? null,
  });

  if (error) throw new Error(`consume_credit failed: ${error.message}`);
  return data === true;
}

export async function refundCredit(userId: string, generationId?: string): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("refund_credit", {
    p_user_id: userId,
    p_generation_id: generationId ?? null,
  });

  if (error) throw new Error(`refund_credit failed: ${error.message}`);
}
