import "server-only";

import { FREE_MONTHLY_CREDITS } from "@/shared/config/credits";

import { getSupabaseAdmin } from "../lib/supabase-admin";

export interface UserRecord {
  id: string;
  email: string;
  language: string;
  credits: number;
  credits_reset_at: string;
  subscription_status: string;
  created_at: string;
}

export async function findUserById(userId: string): Promise<UserRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("id, email, language, credits, credits_reset_at, subscription_status, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`users select failed: ${error.message}`);
  return data;
}

export async function updateUserLanguage(userId: string, language: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("users").update({ language }).eq("id", userId);
  if (error) throw new Error(`users update failed: ${error.message}`);
}

/** Lazy monthly free-credit reset; no-op unless the reset date has passed. */
export async function ensureMonthlyCredits(userId: string): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("ensure_monthly_credits", {
    p_user_id: userId,
    p_free_credits: FREE_MONTHLY_CREDITS,
  });
  if (error) throw new Error(`ensure_monthly_credits failed: ${error.message}`);
}
