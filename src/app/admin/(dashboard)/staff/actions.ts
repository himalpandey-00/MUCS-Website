"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireTeamManager } from "@/lib/admin/auth";

export type StepDownState = { status: "idle" | "error"; message?: string };

// Promotes an existing staff account to ADMIN. Kept Admin-only (not
// delegable to President) — this is the one non-CLI path to the most
// privileged role, so it stays within that tier rather than one step
// removed from it.
export async function grantAdmin(targetId: string) {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") {
    redirect("/admin/unauthorized?reason=role");
  }
  await prisma.adminUser.update({ where: { id: targetId }, data: { role: "ADMIN" } });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

// Revokes dashboard access for a Staff-level account. Deliberately scoped
// to STAFF only (the `role: "STAFF"` filter is a no-op against anything
// else, even a stale or tampered id) — never touches ADMIN, and doesn't
// handle PRESIDENT either: that role is derived from TeamMember.isPresident
// (src/app/admin/(dashboard)/team/actions.ts), so change it by unchecking
// "Club President" there. Revoking it here instead would leave the two out
// of sync until the next save silently re-provisions it.
export async function revokeStaffAccess(targetId: string) {
  await requireTeamManager();
  await prisma.adminUser.deleteMany({ where: { id: targetId, role: "STAFF" } });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

// Self-service only — always acts on the caller's own account (from the
// session), never a parameter, so there's no id here for a request to
// spoof. Refuses if this would leave zero ADMIN accounts, since that would
// permanently lock the club out of ever granting ADMIN again: STAFF and
// PRESIDENT can't, and scripts/invite-admin.ts needs Supabase credentials
// a future committee may not have.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by useActionState's action shape; this action always acts on the caller's own session, never form input.
export async function stepDownFromAdmin(_prevState: StepDownState, _formData: FormData): Promise<StepDownState> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") {
    return { status: "error", message: "You're not an admin." };
  }

  const otherAdmins = await prisma.adminUser.count({ where: { role: "ADMIN", id: { not: session.adminUserId } } });
  if (otherAdmins === 0) {
    return { status: "error", message: "You're the only admin — grant someone else Admin first, then step down." };
  }

  await prisma.adminUser.update({ where: { id: session.adminUserId }, data: { role: "STAFF" } });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}
