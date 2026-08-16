import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseUser } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "./LoginForm";
import { CodeForm } from "./CodeForm";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function AdminLoginPage() {
  // Already have a live Supabase session? Skip straight to the right
  // place rather than showing a login form to someone already signed in.
  const user = await getSupabaseUser();
  if (user?.email) {
    const adminUser = await prisma.adminUser.findUnique({ where: { email: user.email } });
    redirect(adminUser ? "/admin" : "/admin/unauthorized");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container className="w-full max-w-sm">
        <div className="flex flex-col gap-2 pb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-murdoch-red">MUCS Admin</p>
          <h1 className="font-heading text-2xl font-extrabold">Sign in</h1>
          <p className="text-sm text-foreground-muted">
            Enter your committee email and we&apos;ll send you a one-time sign-in link. No password needed.
          </p>
        </div>
        <LoginForm />

        <div className="my-8 flex items-center gap-4 text-xs uppercase tracking-wide text-foreground-muted">
          <span className="h-px flex-1 bg-border" />
          Or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2 pb-4">
          <h2 className="text-sm font-semibold text-foreground">Have a sign-in code?</h2>
          <p className="text-xs text-foreground-muted">
            If a link didn&apos;t work (expired, or a security scanner opened it before you could), enter the code
            instead.
          </p>
        </div>
        <CodeForm />
      </Container>
    </main>
  );
}
