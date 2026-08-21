import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Not authorized" };

// Reached two different ways, distinguished by ?reason=role:
// - No query param: requireAdmin() sent someone here because their signed-
//   in email isn't on the AdminUser allowlist at all — their session was
//   already signed out before the redirect (see src/lib/admin/auth.ts), so
//   "back to sign in" is correct.
// - reason=role: requireTeamManager() sent a legitimate Staff-role admin
//   here because they tried to add/delete a team member, which needs
//   ADMIN or PRESIDENT. Their session is still live, so this should route
//   back into the app, not to login, and the copy shouldn't imply they
//   have no access at all.
export default async function UnauthorizedPage({ searchParams }: PageProps<"/admin/unauthorized">) {
  const { reason } = await searchParams;
  const isRoleIssue = reason === "role";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container className="w-full max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-murdoch-red">MUCS Admin</p>
        <h1 className="mt-2 font-heading text-2xl font-extrabold">Not authorized</h1>
        <p className="mt-3 text-sm text-foreground-muted">
          {isRoleIssue
            ? "Your account doesn't have permission to add or remove team members. Ask an admin or the club president if you need this."
            : "That account isn't on the admin list. Ask an existing admin to add your email, then try signing in again."}
        </p>
        <Link
          href={isRoleIssue ? "/admin/team" : "/admin/login"}
          className="mt-6 inline-block text-sm font-medium text-teal hover:text-foreground"
        >
          {isRoleIssue ? "Back to team" : "Back to sign in"}
        </Link>
      </Container>
    </main>
  );
}
