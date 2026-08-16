import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Not authorized" };

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container className="w-full max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-murdoch-red">MUCS Admin</p>
        <h1 className="mt-2 font-heading text-2xl font-extrabold">Not authorized</h1>
        <p className="mt-3 text-sm text-foreground-muted">
          That account isn&apos;t on the admin list. Ask an existing admin to add your email, then try signing in
          again.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block text-sm font-medium text-teal hover:text-foreground"
        >
          Back to sign in
        </Link>
      </Container>
    </main>
  );
}
