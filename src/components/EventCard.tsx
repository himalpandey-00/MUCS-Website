import Link from "next/link";
import type { Event } from "@/generated/prisma/client";
import { formatEventRange } from "@/lib/format";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 transition-colors hover:border-murdoch-red/60"
    >
      <div className="flex items-center justify-between gap-3">
        {event.category && (
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-cyan">
            {event.category}
          </span>
        )}
        <span className="font-mono text-[11px] text-foreground-muted">
          {formatEventRange(event.startsAt, event.endsAt)}
        </span>
      </div>
      <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-murdoch-red">
        {event.title}
      </h3>
      <p className="text-sm text-foreground-muted">{event.summary}</p>
      {event.location && <p className="mt-auto text-xs text-muted">{event.location}</p>}
    </Link>
  );
}
