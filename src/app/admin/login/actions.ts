"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
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

const codeSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.").max(200),
  code: z.string().trim().min(6, "Enter the code.").max(20),
});

export type CodeFormState = {
  status: "idle" | "error";
  message?: string;
};

// Verifies a code obtained out-of-band (scripts/generate-admin-link.ts
// prints an `email_otp` alongside the link). Exists because clickable
// magic-link URLs are fragile — Supabase's own docs warn that corporate
// link-scanners (e.g. Outlook Safe Links) or chat/email link-preview
// crawlers can "click" a link and burn its one-time token before a human
// does. A plain code has nothing for an automated fetcher to consume.
export async function verifyLoginCode(_prevState: CodeFormState, formData: FormData): Promise<CodeFormState> {
  const parsed = codeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter your email and code." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });

  if (error) {
    console.error("verifyOtp failed:", error.message);
    return { status: "error", message: "That code is wrong, expired, or already used." };
  }

  redirect("/admin");
}
