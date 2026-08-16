import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseUser } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "./LoginForm";

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
      </Container>
    </main>
  );
}
