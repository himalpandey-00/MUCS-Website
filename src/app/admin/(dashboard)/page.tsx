import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardCounts } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Admin" };

const CARDS = [
  { href: "/admin/events", label: "Events", countKey: "events" as const },
  { href: "/admin/news", label: "News articles", countKey: "news" as const },
  { href: "/admin/team", label: "Team members", countKey: "team" as const },
  { href: "/admin/announcements", label: "Announcements", countKey: "announcements" as const },
];

export default async function AdminHomePage() {
  const [session, counts] = await Promise.all([requireAdmin(), getDashboardCounts()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-murdoch-red">MUCS Admin</p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold">
          Welcome{session.name ? `, ${session.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">{session.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-murdoch-red"
          >
            <p className="font-heading text-3xl font-extrabold">{counts[card.countKey]}</p>
            <p className="mt-1 text-sm text-foreground-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground-muted">
          Also editable
        </h2>
        <Link href="/admin/settings" className="mt-3 inline-block text-sm text-teal hover:text-foreground">
          Site settings — contact info, meeting details, socials →
        </Link>
      </div>
    </div>
  );
}
