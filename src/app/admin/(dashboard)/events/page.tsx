import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEventRange } from "@/lib/format";
import { DeleteButton } from "@/components/admin/form";
import { deleteEvent } from "./actions";

export const metadata: Metadata = { title: "Events · Admin" };

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "text-cyan",
  DRAFT: "text-foreground-muted",
  CANCELLED: "text-coral",
};

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">Events</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center justify-center rounded-md bg-murdoch-red px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-white hover:bg-deep-red"
        >
          New event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-foreground-muted">No events yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{event.title}</td>
                  <td className="px-4 py-3 text-foreground-muted">{formatEventRange(event.startsAt, event.endsAt)}</td>
                  <td className={`px-4 py-3 font-medium ${STATUS_STYLES[event.status] ?? ""}`}>{event.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/events/${event.id}/edit`} className="text-sm font-medium text-cyan hover:text-white">
                        Edit
                      </Link>
                      <form action={deleteEvent.bind(null, event.id)}>
                        <DeleteButton confirmMessage={`Delete "${event.title}"? This can't be undone.`} />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
