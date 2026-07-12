import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "./env";

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client: bypasses RLS, must never leak to the client bundle
 * (enforced by the "server-only" import).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const env = getServerEnv();
    adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
