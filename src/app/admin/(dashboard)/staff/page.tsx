import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTeamManager } from "@/lib/admin/auth";
import { ConfirmButton } from "@/components/admin/form";
import { formatShortDate } from "@/lib/format";
import { grantAdmin, revokeStaffAccess } from "./actions";
import { StepDownForm } from "./StepDownForm";

export const metadata: Metadata = { title: "Staff & Access · Admin" };

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "text-murdoch-red",
  PRESIDENT: "text-teal",
  STAFF: "text-foreground-muted",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PRESIDENT: "President",
  STAFF: "Staff",
};

export default async function StaffPage() {
  // requireAdmin() (which this wraps) is React.cache()-wrapped — this
  // doesn't re-run the Supabase/Prisma lookups the layout already did.
  const session = await requireTeamManager();
  const staff = await prisma.adminUser.findMany({ orderBy: [{ role: "asc" }, { email: "asc" }] });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Staff & Access</h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
          Everyone who can sign in to this dashboard, and what they can do here. New Staff accounts appear
          automatically when a team member is added with an email — see{" "}
          <Link href="/admin/team" className="text-teal hover:text-foreground">
            Team
          </Link>
          .
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((person) => (
              <tr key={person.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {person.name ?? "—"}
                  {person.id === session.adminUserId && (
                    <span className="ml-2 text-xs font-normal text-foreground-muted">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{person.email}</td>
                <td className={`px-4 py-3 font-medium ${ROLE_STYLES[person.role]}`}>{ROLE_LABELS[person.role]}</td>
                <td className="px-4 py-3 text-foreground-muted">
                  {person.lastSignInAt ? formatShortDate(person.lastSignInAt) : "Never signed in"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    {person.role === "STAFF" && (
                      <>
                        {session.role === "ADMIN" && (
                          <form action={grantAdmin.bind(null, person.id)}>
                            <ConfirmButton
                              confirmMessage={`Grant Admin to ${person.email}? They'll have full access, same as you.`}
                              className="text-sm font-medium text-teal hover:text-foreground"
                            >
                              Grant Admin
                            </ConfirmButton>
                          </form>
                        )}
                        <form action={revokeStaffAccess.bind(null, person.id)}>
                          <ConfirmButton
                            confirmMessage={`Revoke dashboard access for ${person.email}? They can still be on the team roster — this only removes their sign-in.`}
                            className="text-sm font-medium text-coral hover:text-murdoch-red"
                          >
                            Revoke access
                          </ConfirmButton>
                        </form>
                      </>
                    )}
                    {person.role === "PRESIDENT" && (
                      <span className="text-xs text-foreground-muted">Set via Team page</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {session.role === "ADMIN" && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Handing over Admin</h2>
          <p className="max-w-2xl text-sm text-foreground-muted">
            Graduating, or otherwise passing this on? Grant Admin to your successor above first — once they have
            it, come back here and step yourself down. You can&apos;t step down while you&apos;re the only admin,
            so there&apos;s always someone with access.
          </p>
          <StepDownForm />
        </div>
      )}
    </div>
  );
}
