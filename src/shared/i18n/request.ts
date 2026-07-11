import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { mergeMessages } from "./messages";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const baseMessages = (await import("../../../messages/en.json")).default;
  const messages =
    locale === routing.defaultLocale
      ? baseMessages
      : mergeMessages(baseMessages, (await import(`../../../messages/${locale}.json`)).default);

  return { locale, messages };
});
