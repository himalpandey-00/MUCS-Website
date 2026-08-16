import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { signOutAdmin } from "@/lib/admin/sign-out";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/settings", label: "Settings" },
];

// Guards everything under it — this is the one place requireAdmin() is
// guaranteed to run for the protected admin routes. /admin/login,
// /admin/auth/callback and /admin/unauthorized live outside this route
// group deliberately, since they must work for signed-out/non-admin users.
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex w-full flex-col gap-4 border-b border-border bg-charcoal p-6 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2">
          <Logo size={32} wordmark={false} asLink={false} />
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground-muted">
            Admin
          </span>
        </div>

        <nav aria-label="Admin" className="flex flex-wrap gap-1 md:flex-1 md:flex-col md:flex-nowrap">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs md:mt-auto md:flex-col md:items-start">
          <p className="truncate text-foreground-muted" title={session.email}>
            {session.email}
          </p>
          <Link href="/" className="text-cyan hover:text-white">
            View public site
          </Link>
          <form action={signOutAdmin}>
            <button type="submit" className="text-foreground-muted hover:text-murdoch-red">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div id="main-content" className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </div>
    </div>
  );
}
