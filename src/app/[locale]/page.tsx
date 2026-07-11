import { setRequestLocale } from "next-intl/server";

import { LandingPage } from "@/views/landing";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingPage />;
}
