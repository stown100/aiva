import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/server/auth/session";

/**
 * OAuth / magic-link landing point. Exchanges the auth code for a session
 * (cookies are set by the Supabase server client) and redirects to `next`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/create";
  // Only allow same-origin relative redirects
  const nextPath = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/create";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[api/auth/callback]", error.message);
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
  }

  return NextResponse.redirect(`${origin}${nextPath}`);
}
