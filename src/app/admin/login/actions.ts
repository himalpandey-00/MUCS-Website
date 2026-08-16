"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.").max(200),
});

export type LoginFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Deliberately returns the same message whether or not the email is
// actually on the AdminUser allowlist / has a Supabase Auth account — this
// avoids letting the form be used to enumerate which emails have admin
// access. shouldCreateUser: false stops signInWithOtp from silently
// creating a brand-new Supabase Auth user for an email nobody invited.
export async function requestMagicLink(_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email") });
  const genericMessage = "If that email has admin access, a sign-in link is on its way — check your inbox.";

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl}/admin/auth/callback`,
    },
  });

  if (error) {
    console.error("signInWithOtp failed:", error.message);
  }

  return { status: "success", message: genericMessage };
}
