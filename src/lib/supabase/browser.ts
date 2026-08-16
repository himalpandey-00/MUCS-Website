import { createBrowserClient } from "@supabase/ssr";

// Browser-only Supabase client. Used in exactly one place — the sign-in
// callback page — to read the session Supabase Auth hands back in the URL
// fragment after a magic-link click (the default "implicit flow" email
// template) and persist it to cookies. Everything else in /admin reads
// that same cookie server-side via src/lib/supabase/server.ts.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
