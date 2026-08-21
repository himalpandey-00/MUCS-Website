import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, canManageTeamRoster } from "@/lib/admin/auth";
import { TeamMemberForm } from "../../TeamMemberForm";
import { updateTeamMember } from "../../actions";

export const metadata: Metadata = { title: "Edit team member · Admin" };

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, member] = await Promise.all([requireAdmin(), prisma.teamMember.findUnique({ where: { id } })]);
  if (!member) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">Edit team member</h1>
      <TeamMemberForm
        action={updateTeamMember.bind(null, id)}
        member={member}
        submitLabel="Save changes"
        canManagePresident={canManageTeamRoster(session.role)}
      />
    </div>
  );
}
