import { setRequestLocale } from "next-intl/server";

import { AccountPage } from "@/views/account";

interface AccountRouteProps {
  params: Promise<{ locale: string }>;
}

export default async function AccountRoute({ params }: AccountRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AccountPage />;
}
