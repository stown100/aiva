import { setRequestLocale } from "next-intl/server";

import { CreatePage } from "@/views/create";

interface CreateRouteProps {
  params: Promise<{ locale: string }>;
}

export default async function CreateRoute({ params }: CreateRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CreatePage />;
}
