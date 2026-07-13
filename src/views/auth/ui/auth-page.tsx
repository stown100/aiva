"use client";

import { useEffect } from "react";

import { MeStatus, useMe } from "@/entities/user";
import { SignInCard } from "@/features/sign-in";
import { ROUTES } from "@/shared/config";
import { useRouter } from "@/shared/i18n";
import { AppHeader } from "@/widgets/app-header";

interface AuthPageProps {
  initialError?: boolean;
}

export function AuthPage({ initialError }: AuthPageProps) {
  const { status } = useMe();
  const router = useRouter();

  // Already signed in — the sign-in form makes no sense, go create.
  useEffect(() => {
    if (status === MeStatus.AUTHENTICATED) {
      router.replace(ROUTES.create);
    }
  }, [status, router]);

  return (
    <>
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        {status === MeStatus.AUTHENTICATED || status === MeStatus.LOADING ? (
          <div className="h-80 w-full max-w-sm animate-pulse rounded-3xl bg-muted" aria-hidden />
        ) : (
          <SignInCard initialError={initialError} />
        )}
      </main>
    </>
  );
}
