import type { Announcement } from "@/generated/prisma/client";

export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) return null;
  const [announcement] = announcements;

  return (
    <div role="status" className="border-b border-border bg-accent-soft">
      <div className="mx-auto flex max-w-(--container-content) items-center gap-3 px-6 py-2.5 text-sm sm:px-8 lg:px-10">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-murdoch-red">
          Notice
        </span>
        <p className="text-foreground">
          <span className="font-medium">{announcement.title}</span>
          {announcement.body && <span className="text-foreground-muted"> — {announcement.body}</span>}
        </p>
      </div>
    </div>
  );
}
