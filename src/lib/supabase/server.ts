import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

// Server-only Supabase client, used for Auth alone (sessions / sign-in).
// All content data access still goes through Prisma (src/lib/prisma.ts) —
// this client never touches the database directly.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies can't be written.
          // Harmless as long as middleware.ts is refreshing the session —
          // see middleware.ts.
        }
      },
    },
  });
}
