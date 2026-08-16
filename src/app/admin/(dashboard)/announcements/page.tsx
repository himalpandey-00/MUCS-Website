import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/form";
import { deleteAnnouncement } from "./actions";

export const metadata: Metadata = { title: "Announcements · Admin" };

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">Announcements</h1>
        <Link
          href="/admin/announcements/new"
          className="inline-flex items-center justify-center rounded-md bg-murdoch-red px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-white hover:bg-deep-red"
        >
          New announcement
        </Link>
      </div>

      {announcements.length === 0 ? (
        <p className="text-sm text-foreground-muted">No announcements yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Pinned</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{announcement.title}</td>
                  <td className="px-4 py-3 text-foreground-muted">{announcement.isPinned ? "Yes" : "No"}</td>
                  <td className={`px-4 py-3 font-medium ${announcement.isActive ? "text-teal" : "text-foreground-muted"}`}>
                    {announcement.isActive ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/announcements/${announcement.id}/edit`}
                        className="text-sm font-medium text-teal hover:text-foreground"
                      >
                        Edit
                      </Link>
                      <form action={deleteAnnouncement.bind(null, announcement.id)}>
                        <DeleteButton confirmMessage={`Delete "${announcement.title}"? This can't be undone.`} />
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
