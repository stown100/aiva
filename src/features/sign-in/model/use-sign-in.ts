"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

import { getSupabaseBrowser } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { getPathname } from "@/shared/i18n";
import type { AppLocale } from "@/shared/i18n";

export enum SignInStatus {
  IDLE = "idle",
  SENDING = "sending",
  SENT = "sent",
  ERROR = "error",
}

interface UseSignInResult {
  status: SignInStatus;
  sentTo: string | null;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  reset: () => void;
}

export function useSignIn(): UseSignInResult {
  const locale = useLocale() as AppLocale;
  const [status, setStatus] = useState<SignInStatus>(SignInStatus.IDLE);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const callbackUrl = () => {
    const nextPath = getPathname({ href: ROUTES.create, locale });
    return `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`;
  };

  const sendMagicLink = async (email: string) => {
    setStatus(SignInStatus.SENDING);
    const { error } = await getSupabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });

    if (error) {
      setStatus(SignInStatus.ERROR);
      return;
    }
    setSentTo(email);
    setStatus(SignInStatus.SENT);
  };

  const signInWithGoogle = async () => {
    setStatus(SignInStatus.SENDING);
    const { error } = await getSupabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    // On success the browser navigates away; only errors reach this point.
    if (error) setStatus(SignInStatus.ERROR);
  };

  const reset = () => {
    setStatus(SignInStatus.IDLE);
    setSentTo(null);
  };

  return { status, sentTo, sendMagicLink, signInWithGoogle, reset };
}
