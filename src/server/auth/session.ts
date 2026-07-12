import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getServerEnv } from "../lib/env";

/**
 * Anon-key client bound to the request cookies: used to read the caller's
 * session and to exchange auth codes. Data access goes through the admin
 * client in repositories instead.
 */
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const env = getServerEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — cookie refresh is handled by the proxy.
        }
      },
    },
  });
}

export interface SessionUser {
  id: string;
  email: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}
