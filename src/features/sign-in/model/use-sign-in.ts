"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

import { getSupabaseBrowser } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { getPathname } from "@/shared/i18n";
import type { AppLocale } from "@/shared/i18n";

export type SignInStatus = "idle" | "sending" | "sent" | "error";

interface UseSignInResult {
  status: SignInStatus;
  sentTo: string | null;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  reset: () => void;
}

export function useSignIn(): UseSignInResult {
  const locale = useLocale() as AppLocale;
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const callbackUrl = () => {
    const nextPath = getPathname({ href: ROUTES.create, locale });
    return `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`;
  };

  const sendMagicLink = async (email: string) => {
    setStatus("sending");
    const { error } = await getSupabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });

    if (error) {
      setStatus("error");
      return;
    }
    setSentTo(email);
    setStatus("sent");
  };

  const signInWithGoogle = async () => {
    setStatus("sending");
    const { error } = await getSupabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    // On success the browser navigates away; only errors reach this point.
    if (error) setStatus("error");
  };

  const reset = () => {
    setStatus("idle");
    setSentTo(null);
  };

  return { status, sentTo, sendMagicLink, signInWithGoogle, reset };
}
