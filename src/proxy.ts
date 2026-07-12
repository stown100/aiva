import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "@/shared/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // Refresh the Supabase session on every navigation so server components
  // and API routes always see a valid token; refreshed cookies are written
  // onto the intl response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
