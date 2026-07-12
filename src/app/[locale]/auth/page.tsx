import { setRequestLocale } from "next-intl/server";

import { AuthPage } from "@/views/auth";

interface AuthRouteProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthRoute({ params, searchParams }: AuthRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;

  return <AuthPage initialError={Boolean(error)} />;
}
