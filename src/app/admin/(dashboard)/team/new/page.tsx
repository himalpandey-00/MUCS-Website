import type { Metadata } from "next";
import { requireTeamManager } from "@/lib/admin/auth";
import { TeamMemberForm } from "../TeamMemberForm";
import { createTeamMember } from "../actions";

export const metadata: Metadata = { title: "New team member · Admin" };

// Guards direct navigation too, not just the "New member" button on the
// list page (src/app/admin/(dashboard)/team/page.tsx) — a hidden button
// isn't a security boundary, and createTeamMember itself re-checks this
// again regardless (defense in depth).
export default async function NewTeamMemberPage() {
  await requireTeamManager();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">New team member</h1>
      <TeamMemberForm action={createTeamMember} submitLabel="Create profile" />
    </div>
  );
}
