import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

// Admin-privileged Supabase client — SUPABASE_SECRET_KEY can manage auth
// users directly (inviting new admins). Only import this where that's
// actually needed (see scripts/invite-admin.ts); never from a path that
// handles arbitrary/public request input.
//
// Deliberately no `import "server-only"` guard here, unlike server.ts —
// this module is also imported directly by standalone scripts run via
// `tsx` (outside Next's bundler), and "server-only" only resolves under
// Next's React Server Component build condition; under plain Node it
// throws unconditionally. Never import this file from a "use client"
// component regardless — nothing enforces that here, so be careful.
export function createSupabaseAdminClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
