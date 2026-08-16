import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/form";
import { deleteTeamMember } from "./actions";

export const metadata: Metadata = { title: "Team · Admin" };

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">Team</h1>
        <Link
          href="/admin/team/new"
          className="inline-flex items-center justify-center rounded-md bg-murdoch-red px-4 py-2 text-sm font-heading font-bold uppercase tracking-wide text-white hover:bg-deep-red"
        >
          New member
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-foreground-muted">No team members yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                  <td className="px-4 py-3 text-foreground-muted">{member.position}</td>
                  <td className="px-4 py-3 text-foreground-muted">{member.displayOrder}</td>
                  <td className={`px-4 py-3 font-medium ${member.isActive ? "text-cyan" : "text-foreground-muted"}`}>
                    {member.isActive ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/team/${member.id}/edit`} className="text-sm font-medium text-cyan hover:text-white">
                        Edit
                      </Link>
                      <form action={deleteTeamMember.bind(null, member.id)}>
                        <DeleteButton confirmMessage={`Remove "${member.name}"? This can't be undone.`} />
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
