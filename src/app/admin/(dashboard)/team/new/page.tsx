import type { Metadata } from "next";
import { TeamMemberForm } from "../TeamMemberForm";
import { createTeamMember } from "../actions";

export const metadata: Metadata = { title: "New team member · Admin" };

export default function NewTeamMemberPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-extrabold">New team member</h1>
      <TeamMemberForm action={createTeamMember} submitLabel="Create profile" />
    </div>
  );
}
