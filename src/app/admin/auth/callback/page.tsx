"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Container } from "@/components/ui/Container";

// Supabase's default Magic Link / invite email template uses the implicit
// flow: it redirects here with the session encoded in the URL fragment
// (`#access_token=...`), which never reaches the server. The browser
// client's detectSessionInUrl (default on) reads that fragment and writes
// the session to cookies on load — from there, every server-side check
// (src/lib/admin/auth.ts) reads the same cookie, so this page's only job
// is: wait for that, then hand off to /admin.
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError || !data.session) {
        setError(true);
        return;
      }
      router.replace("/admin");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container className="w-full max-w-sm text-center">
        {error ? (
          <>
            <h1 className="font-heading text-xl font-bold">That link didn&apos;t work</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              It may have expired or already been used. Request a new one from the sign-in page.
            </p>
            <Link href="/admin/login" className="mt-6 inline-block text-sm font-medium text-teal hover:text-foreground">
              Back to sign in
            </Link>
          </>
        ) : (
          <p className="text-sm text-foreground-muted">Signing you in…</p>
        )}
      </Container>
    </main>
  );
}
