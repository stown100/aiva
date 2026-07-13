"use client";

import { getSupabaseBrowser } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useRouter } from "@/shared/i18n";

interface UseSignOutOptions {
  onSignedOut?: () => void;
}

/** Ends the Supabase session and returns the user to the landing page. */
export function useSignOut({ onSignedOut }: UseSignOutOptions = {}) {
  const router = useRouter();

  return async () => {
    await getSupabaseBrowser().auth.signOut();
    onSignedOut?.();
    router.push(ROUTES.home);
    router.refresh();
  };
}
