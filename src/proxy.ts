import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

// Refreshes the Supabase session cookie on /admin requests. Server
// Components can read cookies but not write them, so without this an
// expired access token would never get refreshed and admins would be
// logged out constantly. Scoped to /admin (see `matcher` below) since
// nothing on the public site touches Supabase Auth.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Touches the session and rewrites the cookie if it needed refreshing.
  // The result isn't used here — route guards (src/lib/admin/auth.ts)
  // decide access; this only keeps the cookie itself alive.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
