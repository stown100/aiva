import { setRequestLocale } from "next-intl/server";

import { HistoryPage } from "@/views/history";

interface HistoryRouteProps {
  params: Promise<{ locale: string }>;
}

export default async function HistoryRoute({ params }: HistoryRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HistoryPage />;
}
